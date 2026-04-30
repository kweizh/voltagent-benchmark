import os
import json
import pytest

PROJECT_DIR = "/home/user/agent-app"
INDEX_JS = os.path.join(PROJECT_DIR, "index.js")
OUTPUT_JSON = os.path.join(PROJECT_DIR, "output.json")

def test_index_js_exists():
    assert os.path.isfile(INDEX_JS), f"{INDEX_JS} does not exist."

def test_index_js_uses_z_describe():
    with open(INDEX_JS, "r") as f:
        content = f.read()
    assert ".describe(" in content, "Expected index.js to use Zod's .describe() for tool parameters (e.g. z.string().describe(...))."

def test_output_json_exists_and_valid():
    assert os.path.isfile(OUTPUT_JSON), f"{OUTPUT_JSON} does not exist."
    with open(OUTPUT_JSON, "r") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            pytest.fail(f"{OUTPUT_JSON} is not valid JSON.")
