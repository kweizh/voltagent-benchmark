import os
import shutil
import subprocess
import pytest

PROJECT_DIR = "/home/user/voltagent-guardrails"

def test_project_dir_exists():
    assert os.path.isdir(PROJECT_DIR), f"Project directory {PROJECT_DIR} does not exist."

def test_package_json_exists():
    package_json = os.path.join(PROJECT_DIR, "package.json")
    assert os.path.isfile(package_json), f"package.json not found at {package_json}"

def test_dependencies_installed():
    result = subprocess.run(
        ["npm", "list", "@voltagent/core"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"@voltagent/core is not installed: {result.stderr}"
    
    result = subprocess.run(
        ["npm", "list", "zod"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"zod is not installed: {result.stderr}"
