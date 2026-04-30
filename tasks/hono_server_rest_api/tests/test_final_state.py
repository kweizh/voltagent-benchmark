import os
import signal
import subprocess
import time
import socket
import pytest
import urllib.request
import urllib.error
import json

PROJECT_DIR = "/home/user/voltagent-app"
PORT = 3000


def wait_for_port(port, timeout=60):
    start_time = time.time()
    while time.time() - start_time < timeout:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(('localhost', port)) == 0:
                return True
        time.sleep(2)
    return False


@pytest.fixture(scope="module")
def start_app():
    # Start the app
    process = subprocess.Popen(
        ["node", "index.js"],
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

    # Shut down the app — SIGTERM first, SIGKILL fallback if it ignores us.
    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
    try:
        process.wait(timeout=30)
    except subprocess.TimeoutExpired:
        os.killpg(os.getpgid(process.pid), signal.SIGKILL)
        process.wait(timeout=10)


def test_api_status_endpoint(start_app):
    """Verify that the /api/status endpoint returns the correct JSON response."""
    url = f"http://localhost:{PORT}/api/status"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as response:
            assert response.status == 200, f"Expected status 200, got {response.status}"
            data = json.loads(response.read().decode('utf-8'))
            assert data.get("status") == "running", f"Expected {{'status': 'running'}}, got {data}"
    except (urllib.error.URLError, TimeoutError) as e:
        pytest.fail(f"Failed to fetch or parse {url}: {e}")
