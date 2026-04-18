import os
import shutil
import pytest

PROJECT_DIR = "/workspace/voltagent"
INSTRUCTION_FILE = "/workspace/instruction.md"

def test_working_directory_exists():
    assert os.path.isdir(PROJECT_DIR), f"Project directory {PROJECT_DIR} does not exist."

def test_instruction_file_exists():
    assert os.path.isfile(INSTRUCTION_FILE), f"Instruction file {INSTRUCTION_FILE} does not exist."
