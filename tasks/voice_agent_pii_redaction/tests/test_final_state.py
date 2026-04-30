import os
import subprocess
import pytest

WORKSPACE_DIR = "/home/user/workspace"
INDEX_TS_FILE = os.path.join(WORKSPACE_DIR, "index.ts")
TEST_RUNNER_TS = os.path.join(WORKSPACE_DIR, "test_runner.ts")
REDACT_PII_TIMEOUT_SEC = int(os.environ.get("REDACT_PII_TIMEOUT_SEC", "60"))

def test_index_ts_exists():
    assert os.path.isfile(INDEX_TS_FILE), f"The required file {INDEX_TS_FILE} does not exist."

def test_redact_pii_function():
    # Write a test runner script
    # NOTE: we explicitly process.exit(0) on success because frameworks like
    # VoltAgent register signal handlers / async resources that keep the
    # event loop alive even after the user code finishes. Without the
    # forced exit, tsx would hang until the subprocess timeout fires even
    # though redactPii returned the correct value in seconds.
    test_script_content = """
import { redactPii } from './index.ts';

async function runTest() {
    const input = "My name is John Doe and my email is john.doe@example.com. Call me at 555-1234.";
    const output = await redactPii(input);
    console.log("REDACTED_OUTPUT:", output);
}

runTest().then(
    () => process.exit(0),
    (err) => { console.error(err); process.exit(1); },
);
"""
    with open(TEST_RUNNER_TS, "w") as f:
        f.write(test_script_content)

    # Run the test script using tsx with a hard timeout so that a hung
    # LLM call in the agent's code fails fast rather than consuming the
    # entire verifier budget.
    try:
        result = subprocess.run(
            ["tsx", "test_runner.ts"],
            cwd=WORKSPACE_DIR,
            capture_output=True,
            text=True,
            timeout=REDACT_PII_TIMEOUT_SEC,
        )
    except subprocess.TimeoutExpired as e:
        pytest.fail(
            f"redactPii test runner timed out after {REDACT_PII_TIMEOUT_SEC}s. "
            f"stdout: {e.stdout!r}\nstderr: {e.stderr!r}"
        )

    assert result.returncode == 0, f"Error running test script: {result.stderr}"

    output = result.stdout
    assert "REDACTED_OUTPUT:" in output, f"Test script did not output expected format. Output: {output}"

    # Extract the redacted string
    redacted_line = [line for line in output.split("\\n") if line.startswith("REDACTED_OUTPUT:")][0]
    redacted_text = redacted_line.replace("REDACTED_OUTPUT:", "").strip()

    # Check that PII is redacted
    assert "John Doe" not in redacted_text, "Name 'John Doe' was not redacted."
    assert "john.doe@example.com" not in redacted_text, "Email 'john.doe@example.com' was not redacted."
    assert "555-1234" not in redacted_text, "Phone number '555-1234' was not redacted."
    assert "[REDACTED]" in redacted_text, "Expected replacement token '[REDACTED]' not found in output."
