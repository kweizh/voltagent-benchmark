import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/myproject"
OUTPUT_FILE = os.path.join(PROJECT_DIR, "output.txt")
INDEX_FILE = os.path.join(PROJECT_DIR, "index.ts")

def test_index_ts_exists():
    assert os.path.isfile(INDEX_FILE), f"{INDEX_FILE} not found."

def test_index_ts_content():
    with open(INDEX_FILE, "r") as f:
        content = f.read()
    assert "Agent" in content, "Expected 'Agent' to be imported and used in index.ts."
    assert "createWorkflowChain" in content, "Expected 'createWorkflowChain' to be imported and used in index.ts."
    assert "gpt-4o-mini" in content, "Expected 'gpt-4o-mini' to be used as the model."

def test_output_file_exists_and_contains_text():
    assert os.path.isfile(OUTPUT_FILE), f"{OUTPUT_FILE} not found. The workflow must save output to this file."
    with open(OUTPUT_FILE, "r") as f:
        content = f.read()
    assert len(content.strip()) > 0, "The output.txt file is empty."
    # Basic heuristic to check if it's an essay about AI
    assert "AI" in content or "artificial intelligence" in content.lower(), "The output doesn't seem to be about AI."

def test_workflow_execution():
    # Run the script to verify it executes without errors
    result = subprocess.run(
        ["npx", "ts-node", "index.ts"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"Execution of index.ts failed: {result.stderr}\n{result.stdout}"
