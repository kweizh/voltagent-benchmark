import os
import signal
import subprocess
import time
import pytest

PROJECT_DIR = "/home/user/myproject"
OUTPUT_FILE = os.path.join(PROJECT_DIR, "output.txt")
INDEX_FILE = os.path.join(PROJECT_DIR, "index.ts")
TS_NODE_TIMEOUT_SEC = int(os.environ.get("TS_NODE_TIMEOUT_SEC", "90"))


def test_index_ts_exists():
    assert os.path.isfile(INDEX_FILE), f"{INDEX_FILE} not found."


def test_index_ts_content():
    with open(INDEX_FILE, "r") as f:
        content = f.read()
    assert "Agent" in content, "Expected 'Agent' to be imported and used in index.ts."
    assert "createWorkflowChain" in content, "Expected 'createWorkflowChain' to be imported and used in index.ts."
    assert "gpt-4o-mini" in content, "Expected 'gpt-4o-mini' to be used as the model."


def test_output_file_exists_and_contains_text():
    assert os.path.isfile(OUTPUT_FILE), f"{OUTPUT_FILE} not found. The workflow must save output to this file."
    with open(OUTPUT_FILE, "r") as f:
        content = f.read()
    assert len(content.strip()) > 0, "The output.txt file is empty."
    # Basic heuristic to check if it's an essay about AI
    assert "AI" in content or "artificial intelligence" in content.lower(), "The output doesn't seem to be about AI."


def test_workflow_execution():
    # Run the agent's index.ts in the background and poll until output.txt is
    # produced (or refreshed). VoltAgent commonly leaks event-loop handles, so
    # the script may never exit on its own; we don't require it to. As long as
    # the workflow's side-effect lands within the timeout, we tear the process
    # down and consider the run successful.
    prior_mtime = os.path.getmtime(OUTPUT_FILE) if os.path.isfile(OUTPUT_FILE) else 0.0

    proc = subprocess.Popen(
        ["npx", "ts-node", "index.ts"],
        cwd=PROJECT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        preexec_fn=os.setsid,
    )

    deadline = time.monotonic() + TS_NODE_TIMEOUT_SEC
    side_effect_seen = False
    early_exit_code = None
    try:
        while time.monotonic() < deadline:
            if os.path.isfile(OUTPUT_FILE):
                mtime = os.path.getmtime(OUTPUT_FILE)
                size = os.path.getsize(OUTPUT_FILE)
                if mtime > prior_mtime and size > 0:
                    side_effect_seen = True
                    time.sleep(1.0)  # let trailing writes flush
                    break
            rc = proc.poll()
            if rc is not None:
                early_exit_code = rc
                break
            time.sleep(0.5)
    finally:
        if proc.poll() is None:
            try:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
                proc.wait(timeout=5)
            except Exception:
                try:
                    os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
                except Exception:
                    pass
        try:
            stdout, stderr = proc.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            stdout, stderr = "", ""

    if not side_effect_seen:
        if early_exit_code is not None and early_exit_code != 0:
            pytest.fail(
                f"index.ts exited with code {early_exit_code} before refreshing "
                f"{OUTPUT_FILE}.\nstdout: {stdout!r}\nstderr: {stderr!r}"
            )
        pytest.fail(
            f"{OUTPUT_FILE} was not produced/refreshed within "
            f"{TS_NODE_TIMEOUT_SEC}s.\nstdout: {stdout!r}\nstderr: {stderr!r}"
        )
