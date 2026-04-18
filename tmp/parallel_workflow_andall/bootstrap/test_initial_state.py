import os
import shutil
import pytest

PROJECT_DIR = "/home/user/my-agent-app"

def test_working_directory_exists():
    assert os.path.isdir(PROJECT_DIR), f"Directory {PROJECT_DIR} does not exist."
