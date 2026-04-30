import os
import subprocess
import json
import pytest

PROJECT_DIR = "/home/user/app"
VERIFY_SCRIPT = os.path.join(PROJECT_DIR, "verify.ts")
TS_NODE_TIMEOUT_SEC = int(os.environ.get("TS_NODE_TIMEOUT_SEC", "90"))


def test_workflow_conditional_logic():
    # Write the verification script. Force process.exit(0) on success because
    # importing the agent's index.ts can keep Node's event loop alive (e.g.
    # VoltAgent registers signal handlers / async resources); otherwise a
    # successful run would hang until the subprocess timeout fires.
    with open(VERIFY_SCRIPT, "w") as f:
        f.write('''
import workflow from "./index";

async function run() {
    const doubleResult = await workflow.run({ value: 5, operation: "double" });
    const squareResult = await workflow.run({ value: 5, operation: "square" });

    console.log(JSON.stringify({
        double: doubleResult,
        square: squareResult
    }));
}

run().then(
    () => process.exit(0),
    (err) => { console.error(err); process.exit(1); },
);
''')

    # Run the verification script under a hard timeout.
    try:
        result = subprocess.run(
            ["npx", "ts-node", "verify.ts"],
            capture_output=True,
            text=True,
            cwd=PROJECT_DIR,
            timeout=TS_NODE_TIMEOUT_SEC,
        )
    except subprocess.TimeoutExpired as e:
        pytest.fail(
            f"verify.ts timed out after {TS_NODE_TIMEOUT_SEC}s. "
            f"stdout: {e.stdout!r}\nstderr: {e.stderr!r}"
        )

    assert result.returncode == 0, f"Verification script failed: {result.stderr}"

    try:
        output = json.loads(result.stdout.strip())
    except json.JSONDecodeError:
        pytest.fail(f"Could not parse JSON output: {result.stdout}")

    # VoltAgent's workflow.run() returns a WorkflowExecution wrapper:
    # { executionId, workflowId, status, result: <step-output>, ... }
    # The step's own output is also { result: <number> }, so the actual number
    # lives at output.<branch>.result.result. Accept either nesting level so
    # the test works whether the agent flattens or not.
    def _final_value(branch_output):
        if branch_output is None:
            return None
        inner = branch_output.get("result")
        if isinstance(inner, dict):
            return inner.get("result", inner)
        return inner

    double_value = _final_value(output.get("double"))
    square_value = _final_value(output.get("square"))
    assert double_value == 10, f"Expected double result to be 10, got {output.get('double')}"
    assert square_value == 25, f"Expected square result to be 25, got {output.get('square')}"


def test_uses_andwhen():
    index_file = os.path.join(PROJECT_DIR, "index.ts")
    assert os.path.isfile(index_file), "index.ts not found"

    with open(index_file, "r") as f:
        content = f.read()

    assert "andWhen" in content, "The workflow must use `andWhen` for conditional logic."
