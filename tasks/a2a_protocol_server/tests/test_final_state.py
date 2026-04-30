import os
import signal
import socket
import subprocess
import time
import json
import urllib.request
import urllib.error
import pytest

PROJECT_DIR = "/home/user/agent-server"
PORT = 3000
NPM_INSTALL_TIMEOUT_SEC = int(os.environ.get("NPM_INSTALL_TIMEOUT_SEC", "120"))
PROCESS_REQUEST_TIMEOUT_SEC = int(os.environ.get("PROCESS_REQUEST_TIMEOUT_SEC", "45"))


def wait_for_port(port, timeout=60):
    start_time = time.time()
    while time.time() - start_time < timeout:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(('localhost', port)) == 0:
                return True
        time.sleep(2)
    return False


def _post_json(path, payload, timeout):
    url = f"http://localhost:{PORT}{path}"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return response.status, response.read().decode('utf-8')


@pytest.fixture(scope="module")
def start_app():
    # Install dependencies first, just in case they're not fully installed.
    try:
        subprocess.run(
            ["npm", "install"],
            cwd=PROJECT_DIR,
            timeout=NPM_INSTALL_TIMEOUT_SEC,
        )
    except subprocess.TimeoutExpired:
        pytest.fail(f"npm install timed out after {NPM_INSTALL_TIMEOUT_SEC}s")

    # Start the app
    process = subprocess.Popen(
        ["npx", "tsx", "server.ts"],
        cwd=PROJECT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid,
    )

    # Wait for the app to be ready
    if not wait_for_port(PORT):
        os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        pytest.fail(f"App failed to start and listen on port {PORT}.")

    yield

    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
    try:
        process.wait(timeout=30)
    except subprocess.TimeoutExpired:
        os.killpg(os.getpgid(process.pid), signal.SIGKILL)
        process.wait(timeout=10)


def test_process_endpoint_basic(start_app):
    """Baseline: the endpoint responds 200 and the body mentions the payload."""
    payload = {"text": "Please process this incoming A2A message: { 'source': 'node-1', 'data': 'cpu usage at 99%' }"}
    try:
        status, body = _post_json("/api/process", payload, timeout=PROCESS_REQUEST_TIMEOUT_SEC)
    except (urllib.error.URLError, TimeoutError) as e:
        pytest.fail(f"HTTP request to /api/process failed: {e}")

    assert status == 200, f"Expected status 200, got {status}"
    assert "cpu" in body.lower() or "99%" in body, f"Expected summary to mention CPU usage, got: {body}"


def test_process_endpoint_receiver_extracts_structured_payload(start_app):
    """The receiver agent is supposed to extract structured JSON from the
    incoming text. Check that distinctive fields flow through to the
    processor's summary."""
    payload = {
        "text": (
            "Incoming A2A message envelope: "
            "{ 'source': 'sensor-7', 'severity': 'critical', "
            "'data': 'temperature exceeded 95C in rack-B' }"
        )
    }
    try:
        status, body = _post_json("/api/process", payload, timeout=PROCESS_REQUEST_TIMEOUT_SEC)
    except (urllib.error.URLError, TimeoutError) as e:
        pytest.fail(f"HTTP request to /api/process failed: {e}")

    assert status == 200, f"Expected status 200, got {status}"
    body_l = body.lower()
    # The processor's summary must reference concrete details from the
    # receiver's extracted payload — guards against hardcoded responses.
    assert "sensor-7" in body_l or "rack-b" in body_l or "95" in body, \
        f"Processor summary missing distinctive payload fields. Body: {body}"
    assert "temperature" in body_l or "critical" in body_l, \
        f"Processor summary missing semantic content from payload. Body: {body}"


def test_process_endpoint_rejects_empty_text(start_app):
    """Malformed / empty input should not 500 — endpoint should stay up."""
    try:
        status, _ = _post_json("/api/process", {"text": ""}, timeout=PROCESS_REQUEST_TIMEOUT_SEC)
    except urllib.error.HTTPError as e:
        # 4xx is acceptable; we just don't want crashes.
        assert 400 <= e.code < 500, f"Empty input triggered server error {e.code}"
        return
    except (urllib.error.URLError, TimeoutError) as e:
        pytest.fail(f"Empty-input request failed at transport layer: {e}")
    assert status in (200, 400, 422), f"Unexpected status for empty input: {status}"


def test_server_still_alive_after_requests(start_app):
    """After handling the earlier requests, the server should still be listening."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(5)
        assert sock.connect_ex(('localhost', PORT)) == 0, \
            f"Server no longer listening on port {PORT} after requests."
