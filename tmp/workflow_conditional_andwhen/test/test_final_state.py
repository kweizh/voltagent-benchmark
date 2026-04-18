import os
import subprocess
import json
import pytest

PROJECT_DIR = "/home/user/app"
VERIFY_SCRIPT = os.path.join(PROJECT_DIR, "verify.ts")

def test_workflow_conditional_logic():
    # Write the verification script
    with open(VERIFY_SCRIPT, "w") as f:
        f.write('''
import workflow from "./index";

async function run() {
    try {
        const doubleResult = await workflow.run({ value: 5, operation: "double" });
        const squareResult = await workflow.run({ value: 5, operation: "square" });
        
        console.log(JSON.stringify({
            double: doubleResult,
            square: squareResult
        }));
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
''')
    
    # Run the verification script
    result = subprocess.run(
        ["npx", "ts-node", "verify.ts"],
        capture_output=True,
        text=True,
        cwd=PROJECT_DIR
    )
    
    assert result.returncode == 0, f"Verification script failed: {result.stderr}"
    
    try:
        output = json.loads(result.stdout.strip())
    except json.JSONDecodeError:
        pytest.fail(f"Could not parse JSON output: {result.stdout}")
        
    assert output.get("double", {}).get("result") == 10, f"Expected double result to be 10, got {output.get('double')}"
    assert output.get("square", {}).get("result") == 25, f"Expected square result to be 25, got {output.get('square')}"

def test_uses_andwhen():
    index_file = os.path.join(PROJECT_DIR, "index.ts")
    assert os.path.isfile(index_file), "index.ts not found"
    
    with open(index_file, "r") as f:
        content = f.read()
        
    assert "andWhen" in content, "The workflow must use `andWhen` for conditional logic."
