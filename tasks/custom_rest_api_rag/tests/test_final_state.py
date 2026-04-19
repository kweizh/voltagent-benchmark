import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/voltagent-project"

def test_npm_test_passes():
    """Priority 1: Use npm test to verify the implementation."""
    result = subprocess.run(
        ["npm", "test"],
        cwd=PROJECT_DIR,
        capture_output=True, text=True
    )
    assert result.returncode == 0, f"'npm test' failed: {result.stderr}\n{result.stdout}"

def test_retriever_file_exists():
    """Priority 3 fallback: basic file existence check."""
    retriever_path = os.path.join(PROJECT_DIR, "src", "retriever.ts")
    assert os.path.isfile(retriever_path), f"File {retriever_path} does not exist."
