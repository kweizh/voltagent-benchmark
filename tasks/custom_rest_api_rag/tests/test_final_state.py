import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/voltagent-project"
NPM_TEST_TIMEOUT_SEC = int(os.environ.get("NPM_TEST_TIMEOUT_SEC", "180"))


def test_npm_test_passes():
    """Priority 1: Use npm test to verify the implementation."""
    try:
        result = subprocess.run(
            ["npm", "test"],
            cwd=PROJECT_DIR,
            capture_output=True,
            text=True,
            timeout=NPM_TEST_TIMEOUT_SEC,
        )
    except subprocess.TimeoutExpired as e:
        pytest.fail(
            f"npm test timed out after {NPM_TEST_TIMEOUT_SEC}s. "
            f"stdout: {e.stdout!r}\nstderr: {e.stderr!r}"
        )
    assert result.returncode == 0, f"'npm test' failed: {result.stderr}\n{result.stdout}"


def test_retriever_file_exists():
    """Priority 3 fallback: basic file existence check."""
    retriever_path = os.path.join(PROJECT_DIR, "src", "retriever.ts")
    assert os.path.isfile(retriever_path), f"File {retriever_path} does not exist."
