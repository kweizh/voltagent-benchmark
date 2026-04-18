import os
import shutil
import pytest

PROJECT_DIR = "/home/user/voltagent-project"

def test_project_directory_exists():
    assert os.path.isdir(PROJECT_DIR), f"Project directory {PROJECT_DIR} does not exist."

def test_package_json_exists():
    pkg_path = os.path.join(PROJECT_DIR, "package.json")
    assert os.path.isfile(pkg_path), f"File {pkg_path} does not exist."

def test_node_modules_exists():
    nm_path = os.path.join(PROJECT_DIR, "node_modules", "@voltagent", "core")
    assert os.path.isdir(nm_path), f"VoltAgent core not found at {nm_path}."

def test_test_file_exists():
    test_path = os.path.join(PROJECT_DIR, "test", "retriever.test.ts")
    assert os.path.isfile(test_path), f"Test file {test_path} does not exist."
