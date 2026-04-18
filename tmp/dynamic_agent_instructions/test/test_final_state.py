import os
import pytest

PROJECT_DIR = "/home/user/myproject"
INDEX_FILE = os.path.join(PROJECT_DIR, "index.ts")

def test_project_dir_exists():
    assert os.path.isdir(PROJECT_DIR), f"Project directory {PROJECT_DIR} does not exist."

def test_index_file_exists():
    assert os.path.isfile(INDEX_FILE), f"File {INDEX_FILE} does not exist."

def test_agent_exported():
    with open(INDEX_FILE, "r") as f:
        content = f.read()
    assert "dynamicAgent" in content, "Expected 'dynamicAgent' to be exported in index.ts."
    assert "DynamicAssistant" in content, "Expected agent name to be 'DynamicAssistant'."
    assert "You are a dynamic assistant." in content, "Expected instructions 'You are a dynamic assistant.'."
    assert "get_status" in content, "Expected tool 'get_status' to be defined."
