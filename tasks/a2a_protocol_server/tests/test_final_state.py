import os
import subprocess
import time
import socket
import json
import urllib.request
import pytest

PROJECT_DIR = "/home/user/agent-server"

def wait_for_port(port, timeout=60):
    start_time = time.time()
    while time.time() - start_time < timeout:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(('localhost', port)) == 0:
                return True
        time.sleep(5)
    return False

@pytest.fixture(scope="module")
def start_app():
    # Install dependencies first, just in case they're not fully installed
    subprocess.run(["npm", "install"], cwd=PROJECT_DIR)

    # Start the app
    process = subprocess.Popen(
        ["npx", "tsx", "server.ts"],
        cwd=PROJECT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid
    )
    
    # Wait for the app to be ready
    if not wait_for_port(3000):
        # Kill the process group before failing
        import signal
        os.killpg(os.getpgid(process.pid), signal.SIGTERM)
        pytest.fail("App failed to start and listen on port 3000.")
    
    yield
    
    # Shut down the app
    import signal
    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
    process.wait(timeout=30)

def test_process_endpoint(start_app):
    """Priority 3 fallback: Simple HTTP request to verify the agent workflow."""
    url = "http://localhost:3000/api/process"
    payload = {"text": "Please process this incoming A2A message: { 'source': 'node-1', 'data': 'cpu usage at 99%' }"}
    data = json.dumps(payload).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            assert response.status == 200, f"Expected status 200, got {response.status}"
            body = response.read().decode('utf-8')
            assert "cpu" in body.lower() or "99%" in body, f"Expected summary to mention CPU usage, got: {body}"
    except Exception as e:
        pytest.fail(f"HTTP request to /api/process failed: {e}")
