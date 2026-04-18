import os
import shutil
import subprocess
import pytest

PROJECT_DIR = "/home/user/myproject"

def test_project_dir_exists():
    assert os.path.isdir(PROJECT_DIR), f"Project directory {PROJECT_DIR} does not exist."

def test_postgres_running():
    result = subprocess.run(
        ["psql", "-U", "postgres", "-d", "postgres", "-c", "SELECT 1;"],
        capture_output=True, text=True
    )
    assert result.returncode == 0, f"PostgreSQL is not running or accessible: {result.stderr}"
