import os
import re
import signal
import subprocess
import time
import pytest

PROJECT_DIR = "/home/user/app"
LOG_FILE = os.path.join(PROJECT_DIR, "hooks.log")
INDEX_JS = os.path.join(PROJECT_DIR, "index.js")
NPM_INSTALL_TIMEOUT_SEC = int(os.environ.get("NPM_INSTALL_TIMEOUT_SEC", "120"))
NODE_RUN_TIMEOUT_SEC = int(os.environ.get("NODE_RUN_TIMEOUT_SEC", "60"))

# We expect all four hook lines to land in the log; anything less means the
# agent's run never produced a complete trace.
_REQUIRED_HOOK_MARKERS = (
    "HOOK: onStart",
    "HOOK: onToolStart - calculate_sum",
    "HOOK: onToolEnd - calculate_sum",
    "HOOK: onEnd",
)


def _log_complete(path: str) -> bool:
    if not os.path.isfile(path):
        return False
    try:
        with open(path, "r") as f:
            content = f.read()
    except OSError:
        return False
    return all(marker in content for marker in _REQUIRED_HOOK_MARKERS)


@pytest.fixture(scope="module", autouse=True)
def setup_and_run_agent():
    # Install dependencies
    try:
        install_result = subprocess.run(
            ["npm", "install"],
            cwd=PROJECT_DIR,
            capture_output=True,
            text=True,
            timeout=NPM_INSTALL_TIMEOUT_SEC,
        )
    except subprocess.TimeoutExpired as e:
        pytest.fail(f"npm install timed out after {NPM_INSTALL_TIMEOUT_SEC}s: {e.stderr!r}")
    assert install_result.returncode == 0, f"npm install failed: {install_result.stderr}"

    # Run the agent's script in the background and poll for the side-effect
    # (hooks.log with all four expected markers). VoltAgent commonly leaks
    # event-loop handles, so the script may never exit on its own. We don't
    # require clean termination — we require the log to land, then we kill it.
    if os.path.isfile(LOG_FILE):
        os.remove(LOG_FILE)

    env = os.environ.copy()
    proc = subprocess.Popen(
        ["node", "index.js"],
        cwd=PROJECT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        text=True,
        preexec_fn=os.setsid,
    )

    deadline = time.monotonic() + NODE_RUN_TIMEOUT_SEC
    log_complete = False
    early_exit_code = None
    try:
        while time.monotonic() < deadline:
            if _log_complete(LOG_FILE):
                log_complete = True
                # Give the script a brief grace window so any trailing log
                # entries (e.g. onEnd flushed slightly after) are written.
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
            proc.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            pass

    if not log_complete and early_exit_code not in (None, 0):
        pytest.fail(
            f"node index.js exited with code {early_exit_code} before producing "
            f"a complete {LOG_FILE}."
        )

    # Don't fail here on missing-log: let the per-test assertions (which give
    # more specific messages) surface the failure mode.
    yield


def _read_log():
    with open(LOG_FILE, "r") as f:
        return f.read()


def test_log_file_exists():
    assert os.path.isfile(LOG_FILE), f"Log file not found at {LOG_FILE}"


def test_log_file_contains_onstart():
    assert "HOOK: onStart" in _read_log(), "Expected 'HOOK: onStart' in hooks.log"


def test_log_file_contains_ontoolstart():
    assert "HOOK: onToolStart - calculate_sum" in _read_log(), \
        "Expected 'HOOK: onToolStart - calculate_sum' in hooks.log"


def test_log_file_contains_ontoolend():
    assert "HOOK: onToolEnd - calculate_sum" in _read_log(), \
        "Expected 'HOOK: onToolEnd - calculate_sum' in hooks.log"


def test_log_file_contains_onend():
    assert "HOOK: onEnd" in _read_log(), "Expected 'HOOK: onEnd' in hooks.log"


def test_log_file_order():
    lines = [line.strip() for line in _read_log().splitlines() if line.strip().startswith("HOOK:")]
    expected_order = [
        "HOOK: onStart",
        "HOOK: onToolStart - calculate_sum",
        "HOOK: onToolEnd - calculate_sum",
        "HOOK: onEnd",
    ]
    actual_order = [line for line in lines if line in expected_order]
    # The agent may invoke generateText more than once (e.g. retries, or a
    # warm-up call). Accept any concatenation of complete 4-hook runs as long
    # as every chunk preserves the expected order.
    assert len(actual_order) > 0, "No expected hook lines found in log."
    assert len(actual_order) % len(expected_order) == 0, (
        f"Hook log length {len(actual_order)} is not a multiple of "
        f"{len(expected_order)} — got an incomplete run: {actual_order}"
    )
    for i in range(0, len(actual_order), len(expected_order)):
        chunk = actual_order[i:i + len(expected_order)]
        assert chunk == expected_order, (
            f"Hooks out of order in run #{i // len(expected_order) + 1}: "
            f"expected {expected_order}, got {chunk}"
        )


def test_tool_actually_invoked_once_per_call():
    """The tool hook pair must fire at least once, and counts must match —
    hardcoded sums or skipped tool calls would break this."""
    content = _read_log()
    n_start = content.count("HOOK: onToolStart - calculate_sum")
    n_end = content.count("HOOK: onToolEnd - calculate_sum")
    assert n_start >= 1, "calculate_sum tool was never started — agent likely hardcoded the result."
    assert n_start == n_end, \
        f"onToolStart/onToolEnd counts differ ({n_start} vs {n_end}) — tool did not complete cleanly."


def test_index_js_uses_tool_and_hooks():
    """Guard against stubbed implementations that write the log lines
    without wiring up a real tool or real hooks."""
    assert os.path.isfile(INDEX_JS), f"{INDEX_JS} missing"
    with open(INDEX_JS, "r") as f:
        src = f.read()
    assert "calculate_sum" in src, "index.js must define/reference the calculate_sum tool"
    # Must reference every required hook name rather than just writing their log strings.
    for hook in ("onStart", "onToolStart", "onToolEnd", "onEnd"):
        assert re.search(rf"\b{hook}\b", src), f"index.js must wire up the {hook} hook"
    # Must perform a real generateText call rather than just writing log lines.
    assert "generateText" in src, "index.js must call agent.generateText(...)"


def test_generate_text_result_reflects_sum():
    """If the agent ran end-to-end, the model's final output should include
    the correct sum (15 + 27 = 42). We accept this being present in the
    agent's stdout or an optional result.txt the script may emit."""
    candidates = []
    stdout_path = os.path.join(PROJECT_DIR, "run-stdout.txt")
    result_path = os.path.join(PROJECT_DIR, "result.txt")
    for p in (stdout_path, result_path):
        if os.path.isfile(p):
            with open(p, "r") as f:
                candidates.append(f.read())
    # If neither file exists, the test is a no-op — we don't want to force
    # a specific side-channel. The log-based tests above still gate correctness.
    if not candidates:
        pytest.skip("No run-stdout.txt / result.txt emitted by index.js; skipping output-value check.")
    assert any("42" in c for c in candidates), \
        "Expected the agent's final output to contain the computed sum '42'."
