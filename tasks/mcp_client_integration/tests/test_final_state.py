import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/app"
NODE_RUN_TIMEOUT_SEC = int(os.environ.get("NODE_RUN_TIMEOUT_SEC", "90"))


def _run_node(script_name: str):
    """Run an agent-loaded test script under tsx/node with a hard timeout.

    The embedded scripts force process.exit(0) on success because importing
    the agent's index.js can keep Node's event loop alive (e.g. MCP client
    sockets, framework signal handlers); without the forced exit a
    successful run would hang until the subprocess timeout fires.
    """
    try:
        return subprocess.run(
            ["node", script_name],
            capture_output=True,
            text=True,
            cwd=PROJECT_DIR,
            timeout=NODE_RUN_TIMEOUT_SEC,
        )
    except subprocess.TimeoutExpired as e:
        pytest.fail(
            f"{script_name} timed out after {NODE_RUN_TIMEOUT_SEC}s. "
            f"stdout: {e.stdout!r}\nstderr: {e.stderr!r}"
        )


def test_math_server_tool_usage():
    """Priority 3: Verify the agent uses the math server's tool to multiply."""

    test_script_path = os.path.join(PROJECT_DIR, "test_math.js")
    with open(test_script_path, "w") as f:
        f.write("""
import { runAgent } from './index.js';

async function main() {
  const result = await runAgent("What is 15 multiplied by 4?");
  if (result.includes("60")) {
    console.log("MATH_SUCCESS");
  } else {
    console.error("Result was:", result);
    process.exit(1);
  }
}
main().then(
  () => process.exit(0),
  (e) => { console.error(e); process.exit(1); },
);
""")

    result = _run_node("test_math.js")

    assert result.returncode == 0, f"Math test script failed: {result.stderr}"
    assert "MATH_SUCCESS" in result.stdout, f"Expected agent to use math server tool and return 60, got: {result.stdout}"


def test_string_server_tool_usage():
    """Priority 3: Verify the agent uses the string server's tool to reverse a string."""

    test_script_path = os.path.join(PROJECT_DIR, "test_string.js")
    with open(test_script_path, "w") as f:
        f.write("""
import { runAgent } from './index.js';

async function main() {
  const result = await runAgent("Reverse the string 'voltagent'");
  if (result.toLowerCase().includes("tnegatlov")) {
    console.log("STRING_SUCCESS");
  } else {
    console.error("Result was:", result);
    process.exit(1);
  }
}
main().then(
  () => process.exit(0),
  (e) => { console.error(e); process.exit(1); },
);
""")

    result = _run_node("test_string.js")

    assert result.returncode == 0, f"String test script failed: {result.stderr}"
    assert "STRING_SUCCESS" in result.stdout, f"Expected agent to use string server tool and return 'tnegatlov', got: {result.stdout}"
