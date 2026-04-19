import os
import subprocess
import json
import pytest

PROJECT_DIR = "/home/user/my-agent-app"
INDEX_FILE = os.path.join(PROJECT_DIR, "index.ts")
RUN_FILE = os.path.join(PROJECT_DIR, "run.ts")
OUTPUT_FILE = os.path.join(PROJECT_DIR, "output.json")

def test_index_file_exists_and_contains_andAll():
    assert os.path.isfile(INDEX_FILE), f"index.ts not found at {INDEX_FILE}"
    with open(INDEX_FILE, "r") as f:
        content = f.read()
    assert "andAll" in content, "Expected `andAll` in index.ts."

def test_run_script_execution():
    assert os.path.isfile(RUN_FILE), f"run.ts not found at {RUN_FILE}"
    
    # Run the script
    result = subprocess.run(
        ["npx", "tsx", "run.ts"],
        capture_output=True, text=True, cwd=PROJECT_DIR
    )
    assert result.returncode == 0, f"run.ts execution failed: {result.stderr}"
    
    # Verify output file exists
    assert os.path.isfile(OUTPUT_FILE), f"output.json not found at {OUTPUT_FILE}"
    
    # Verify output is valid JSON
    with open(OUTPUT_FILE, "r") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            pytest.fail("output.json is not a valid JSON file.")
