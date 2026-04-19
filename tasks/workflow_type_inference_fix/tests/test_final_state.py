import os
import subprocess
import pytest

PROJECT_DIR = "/workspace/voltagent"

def test_typecheck_and_tests_pass():
    """Priority 1: Use pnpm to run typecheck and tests to verify the final state."""
    
    # Try running typecheck first
    result = subprocess.run(
        ["pnpm", "run", "typecheck"],
        capture_output=True, text=True, cwd=PROJECT_DIR
    )
    
    if result.returncode != 0 and ("Missing script" in result.stderr or "Missing script" in result.stdout):
        # Fallback to test if typecheck script is missing
        result = subprocess.run(
            ["pnpm", "run", "test"],
            capture_output=True, text=True, cwd=PROJECT_DIR
        )
        
    assert result.returncode == 0, \
        f"Type checking or tests failed. Exit code: {result.returncode}\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
