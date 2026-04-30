import os
import signal
import subprocess
import time
import json
import pytest

PROJECT_DIR = "/home/user/my-agent-app"
INDEX_FILE = os.path.join(PROJECT_DIR, "index.ts")
RUN_FILE = os.path.join(PROJECT_DIR, "run.ts")
OUTPUT_FILE = os.path.join(PROJECT_DIR, "output.json")
TSX_RUN_TIMEOUT_SEC = int(os.environ.get("TSX_RUN_TIMEOUT_SEC", "90"))


def test_index_file_exists_and_contains_andAll():
    assert os.path.isfile(INDEX_FILE), f"index.ts not found at {INDEX_FILE}"
    with open(INDEX_FILE, "r") as f:
        content = f.read()
    assert "andAll" in content, "Expected `andAll` in index.ts."


def test_run_script_execution():
    assert os.path.isfile(RUN_FILE), f"run.ts not found at {RUN_FILE}"

    # Run the agent's run.ts in the background and poll until output.json is
    # produced (or refreshed). VoltAgent commonly leaks event-loop handles, so
    # the script may never exit on its own; we don't require it to. As long as
    # the workflow's side-effect lands within the timeout, we tear the process
    # down and consider the run successful.
    prior_mtime = os.path.getmtime(OUTPUT_FILE) if os.path.isfile(OUTPUT_FILE) else 0.0

    proc = subprocess.Popen(
        ["npx", "tsx", "run.ts"],
        cwd=PROJECT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        preexec_fn=os.setsid,
    )

    deadline = time.monotonic() + TSX_RUN_TIMEOUT_SEC
    side_effect_seen = False
    early_exit_code = None
    try:
        while time.monotonic() < deadline:
            if os.path.isfile(OUTPUT_FILE):
                mtime = os.path.getmtime(OUTPUT_FILE)
                size = os.path.getsize(OUTPUT_FILE)
                if mtime > prior_mtime and size > 0:
                    side_effect_seen = True
                    time.sleep(1.0)
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
                f"run.ts exited with code {early_exit_code} before producing "
                f"{OUTPUT_FILE}.\nstdout: {stdout!r}\nstderr: {stderr!r}"
            )
        pytest.fail(
            f"{OUTPUT_FILE} was not produced/refreshed within "
            f"{TSX_RUN_TIMEOUT_SEC}s.\nstdout: {stdout!r}\nstderr: {stderr!r}"
        )

    # Verify output is valid JSON
    with open(OUTPUT_FILE, "r") as f:
        try:
            json.load(f)
        except json.JSONDecodeError:
            pytest.fail("output.json is not a valid JSON file.")
