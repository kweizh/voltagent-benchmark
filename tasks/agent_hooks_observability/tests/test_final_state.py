import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/app"
LOG_FILE = os.path.join(PROJECT_DIR, "hooks.log")

@pytest.fixture(scope="module", autouse=True)
def setup_and_run_agent():
    # Install dependencies
    install_result = subprocess.run(
        ["npm", "install"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    assert install_result.returncode == 0, f"npm install failed: {install_result.stderr}"

    # Run the agent script
    env = os.environ.copy()
    run_result = subprocess.run(
        ["node", "index.js"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True,
        env=env
    )
    assert run_result.returncode == 0, f"node index.js failed: {run_result.stderr}\nStdout: {run_result.stdout}"
    
    yield

def test_log_file_exists():
    assert os.path.isfile(LOG_FILE), f"Log file not found at {LOG_FILE}"

def test_log_file_contains_onstart():
    with open(LOG_FILE, "r") as f:
        content = f.read()
    assert "HOOK: onStart" in content, "Expected 'HOOK: onStart' in hooks.log"

def test_log_file_contains_ontoolstart():
    with open(LOG_FILE, "r") as f:
        content = f.read()
    assert "HOOK: onToolStart - calculate_sum" in content, "Expected 'HOOK: onToolStart - calculate_sum' in hooks.log"

def test_log_file_contains_ontoolend():
    with open(LOG_FILE, "r") as f:
        content = f.read()
    assert "HOOK: onToolEnd - calculate_sum" in content, "Expected 'HOOK: onToolEnd - calculate_sum' in hooks.log"

def test_log_file_contains_onend():
    with open(LOG_FILE, "r") as f:
        content = f.read()
    assert "HOOK: onEnd" in content, "Expected 'HOOK: onEnd' in hooks.log"

def test_log_file_order():
    with open(LOG_FILE, "r") as f:
        lines = [line.strip() for line in f.readlines() if line.strip().startswith("HOOK:")]
    
    expected_order = [
        "HOOK: onStart",
        "HOOK: onToolStart - calculate_sum",
        "HOOK: onToolEnd - calculate_sum",
        "HOOK: onEnd"
    ]
    
    # Filter only the lines we care about to check their relative order
    actual_order = [line for line in lines if line in expected_order]
    
    assert actual_order == expected_order, f"Expected hooks to be called in order {expected_order}, but got {actual_order}"
