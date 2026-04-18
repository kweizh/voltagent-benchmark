import os
import pytest

PROJECT_DIR = "/home/user/myproject"
LOG_FILE = os.path.join(PROJECT_DIR, "output.log")

def test_log_file_exists():
    assert os.path.isfile(LOG_FILE), f"Log file not found at {LOG_FILE}"

def test_log_file_content():
    with open(LOG_FILE, "r") as f:
        content = f.read()
    expected_message = "Operation cancelled: Timeout: Operation took too long"
    assert expected_message in content, f"Expected '{expected_message}' in {LOG_FILE}, got: {content}"
