import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/myproject"

def test_project_exists():
    """Priority 3 fallback: basic file existence check."""
    assert os.path.isdir(PROJECT_DIR), \
        f"Project directory not found at {PROJECT_DIR}"

def test_index_ts_exists():
    """Priority 3 fallback: basic file existence check."""
    index_file = os.path.join(PROJECT_DIR, "src", "index.ts")
    assert os.path.isfile(index_file), \
        f"src/index.ts not found at {index_file}"

def test_workflow_execution():
    """Priority 1: Run the script via CLI and verify output."""
    # First npm install
    subprocess.run(
        ["npm", "install"],
        cwd=PROJECT_DIR,
        capture_output=True
    )
    
    # Then run the script
    result = subprocess.run(
        ["npx", "tsx", "src/index.ts"],
        capture_output=True, text=True, cwd=PROJECT_DIR
    )
    assert result.returncode == 0, \
        f"'npx tsx src/index.ts' failed: {result.stderr}"
    
    stdout = result.stdout.lower()
    assert "fast" in stdout, \
        f"Expected 'fast' in output, got: {result.stdout}"
    assert "slow" not in stdout, \
        f"Expected 'slow' NOT to be in output, got: {result.stdout}"
    assert "medium" not in stdout, \
        f"Expected 'medium' NOT to be in output, got: {result.stdout}"
