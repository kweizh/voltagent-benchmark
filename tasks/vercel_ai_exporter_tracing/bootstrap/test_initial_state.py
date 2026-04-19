import os
import shutil
import pytest

PROJECT_DIR = "/home/user/app"

def test_project_dir_exists():
    assert os.path.isdir(PROJECT_DIR), f"Project directory {PROJECT_DIR} does not exist."

def test_package_json_exists():
    package_json = os.path.join(PROJECT_DIR, "package.json")
    assert os.path.isfile(package_json), f"package.json not found at {package_json}"

def test_index_ts_exists():
    index_ts = os.path.join(PROJECT_DIR, "index.ts")
    assert os.path.isfile(index_ts), f"index.ts not found at {index_ts}"

def test_npm_available():
    assert shutil.which("npm") is not None, "npm binary not found in PATH."
