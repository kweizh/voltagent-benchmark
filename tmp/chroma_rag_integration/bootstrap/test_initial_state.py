import os
import shutil
import socket
import pytest

PROJECT_DIR = "/home/user/project"

def test_npm_available():
    assert shutil.which("npm") is not None, "npm binary not found in PATH."

def test_project_dir_exists():
    assert os.path.isdir(PROJECT_DIR), f"Project directory {PROJECT_DIR} does not exist."

def test_chromadb_running():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        result = sock.connect_ex(("localhost", 8000))
        assert result == 0, "ChromaDB is not running on port 8000."
