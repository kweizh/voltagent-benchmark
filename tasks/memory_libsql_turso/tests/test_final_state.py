import os
import signal
import subprocess
import time
import pytest

PROJECT_DIR = "/home/user/agent-app"
INDEX_FILE = os.path.join(PROJECT_DIR, "index.ts")
DB_FILE = os.path.join(PROJECT_DIR, "memory.db")
TSX_RUN_TIMEOUT_SEC = int(os.environ.get("TSX_RUN_TIMEOUT_SEC", "90"))


def test_index_file_exists():
    assert os.path.isfile(INDEX_FILE), f"index.ts not found at {INDEX_FILE}"
    with open(INDEX_FILE, "r") as f:
        content = f.read()
    # @voltagent/libsql renamed the storage class: older versions exported
    # LibSQLStorage; current versions export LibSQLMemoryAdapter. Accept either.
    assert "LibSQLStorage" in content or "LibSQLMemoryAdapter" in content, (
        "Expected 'LibSQLStorage' or 'LibSQLMemoryAdapter' to be used in index.ts."
    )


def test_db_file_created():
    # Run the agent's script in the background and poll for the side-effect
    # (memory.db). VoltAgent commonly leaks event-loop handles (signal
    # handlers, async resources), so the script may never exit on its own
    # even after the work is done. We don't require it to; we only require
    # that the DB file appears, then we tear the process down.
    if os.path.isfile(DB_FILE):
        os.remove(DB_FILE)

    proc = subprocess.Popen(
        ["npx", "tsx", "index.ts"],
        cwd=PROJECT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        preexec_fn=os.setsid,
    )

    deadline = time.monotonic() + TSX_RUN_TIMEOUT_SEC
    db_appeared = False
    early_exit_code = None
    try:
        while time.monotonic() < deadline:
            if os.path.isfile(DB_FILE) and os.path.getsize(DB_FILE) > 0:
                db_appeared = True
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

    if not db_appeared:
        if early_exit_code is not None and early_exit_code != 0:
            pytest.fail(
                f"index.ts exited with code {early_exit_code} before producing "
                f"{DB_FILE}.\nstdout: {stdout!r}\nstderr: {stderr!r}"
            )
        pytest.fail(
            f"Database file {DB_FILE} was not created within "
            f"{TSX_RUN_TIMEOUT_SEC}s.\nstdout: {stdout!r}\nstderr: {stderr!r}"
        )
