import os
import subprocess
import json
import pytest

PROJECT_DIR = "/home/user/voltagent-guardrails"
LOG_FILE = os.path.join(PROJECT_DIR, "output.log")
INDEX_FILE = os.path.join(PROJECT_DIR, "index.js")
TEST_FILE = os.path.join(PROJECT_DIR, "test.js")

def test_files_exist():
    assert os.path.isfile(INDEX_FILE), f"index.js not found at {INDEX_FILE}"
    assert os.path.isfile(TEST_FILE), f"test.js not found at {TEST_FILE}"

def test_run_script_and_check_output():
    # Run the test script to ensure output.log is generated
    subprocess.run(["node", "test.js"], cwd=PROJECT_DIR)
    
    assert os.path.isfile(LOG_FILE), f"Log file not found at {LOG_FILE}"
    
    with open(LOG_FILE, "r") as f:
        content = f.read()
    
    # Check for the error condition
    assert "secret" in content.lower() or "error" in content.lower() or "reject" in content.lower(), \
        f"Expected an error or rejection for the 'secret' input in the log file."
    
    # Check for the successful response condition
    assert "safe" in content and "true" in content, \
        f"Expected a JSON object with safe: true in the log file, got: {content}"
    assert "response" in content, \
        f"Expected a JSON object with a response field in the log file."

def test_guardrail_workflow_exported():
    # Verify that index.js exports guardrailWorkflow
    result = subprocess.run(
        ["node", "-e", "const wf = require('./index.js').guardrailWorkflow; if (!wf) throw new Error('guardrailWorkflow not exported');"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"guardrailWorkflow is not exported from index.js: {result.stderr}"
