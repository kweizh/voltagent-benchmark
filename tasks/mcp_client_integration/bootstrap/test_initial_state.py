import os
import pytest

PROJECT_DIR = "/home/user/app"
SERVERS_DIR = "/home/user/servers"

def test_project_dir_exists():
    assert os.path.isdir(PROJECT_DIR), f"Project directory {PROJECT_DIR} does not exist."

def test_servers_dir_exists():
    assert os.path.isdir(SERVERS_DIR), f"Servers directory {SERVERS_DIR} does not exist."

def test_math_server_exists():
    math_server = os.path.join(SERVERS_DIR, "math-server.js")
    assert os.path.isfile(math_server), f"Math server {math_server} does not exist."

def test_string_server_exists():
    string_server = os.path.join(SERVERS_DIR, "string-server.js")
    assert os.path.isfile(string_server), f"String server {string_server} does not exist."
