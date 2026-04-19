import os
import subprocess
import pytest

PROJECT_DIR = "/home/user/app"

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
main().catch(e => { console.error(e); process.exit(1); });
""")
    
    result = subprocess.run(
        ["node", "test_math.js"],
        capture_output=True, text=True, cwd=PROJECT_DIR
    )
    
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
main().catch(e => { console.error(e); process.exit(1); });
""")
    
    result = subprocess.run(
        ["node", "test_string.js"],
        capture_output=True, text=True, cwd=PROJECT_DIR
    )
    
    assert result.returncode == 0, f"String test script failed: {result.stderr}"
    assert "STRING_SUCCESS" in result.stdout, f"Expected agent to use string server tool and return 'tnegatlov', got: {result.stdout}"
