import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/myproject"

def test_files_exist():
    assert os.path.isfile(os.path.join(PROJECT_DIR, "storage.ts")), "storage.ts not found."
    assert os.path.isfile(os.path.join(PROJECT_DIR, "index.ts")), "index.ts not found."
    assert os.path.isfile(os.path.join(PROJECT_DIR, "output.log")), "output.log not found."

def test_table_exists():
    result = subprocess.run(
        ["psql", "-U", "postgres", "-d", "postgres", "-t", "-c", "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'agent_memory');"],
        capture_output=True, text=True
    )
    assert result.returncode == 0, f"Failed to query database: {result.stderr}"
    assert "t" in result.stdout.strip(), "Table 'agent_memory' does not exist."

def test_memory_saved():
    result = subprocess.run(
        ["psql", "-U", "postgres", "-d", "postgres", "-t", "-c", "SELECT count(*) FROM agent_memory;"],
        capture_output=True, text=True
    )
    assert result.returncode == 0, f"Failed to query agent_memory table: {result.stderr}"
    count = int(result.stdout.strip())
    assert count > 0, "No memory state was saved to agent_memory table."
