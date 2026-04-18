import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/agent-app"
INDEX_FILE = os.path.join(PROJECT_DIR, "index.ts")
DB_FILE = os.path.join(PROJECT_DIR, "memory.db")

def test_index_file_exists():
    assert os.path.isfile(INDEX_FILE), f"index.ts not found at {INDEX_FILE}"
    with open(INDEX_FILE, "r") as f:
        content = f.read()
    assert "LibSQLStorage" in content, "Expected 'LibSQLStorage' to be used in index.ts."

def test_db_file_created():
    # Run the script to verify it creates the database file
    result = subprocess.run(
        ["npx", "tsx", "index.ts"],
        capture_output=True, text=True, cwd=PROJECT_DIR
    )
    assert result.returncode == 0, f"Running index.ts failed: {result.stderr}"
    assert os.path.isfile(DB_FILE), f"Database file {DB_FILE} was not created."
