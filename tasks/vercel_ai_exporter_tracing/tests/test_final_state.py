import os
import signal
import subprocess
import time
import json
import pytest

PROJECT_DIR = "/home/user/app"
NPM_START_TIMEOUT_SEC = int(os.environ.get("NPM_START_TIMEOUT_SEC", "120"))
LOG_FILE = os.path.join(PROJECT_DIR, "output.log")


def test_telemetry_packages_installed():
    """Priority 3: Check package.json for required telemetry packages."""
    package_json = os.path.join(PROJECT_DIR, "package.json")
    with open(package_json) as f:
        content = json.load(f)

    deps = content.get("dependencies", {})
    assert "@vercel/otel" in deps or "@opentelemetry/sdk-trace-node" in deps, \
        "Expected OpenTelemetry packages to be installed in package.json"
    assert "@opentelemetry/exporter-trace-otlp-http" in deps, \
        "Expected @opentelemetry/exporter-trace-otlp-http to be installed in package.json"


def test_index_ts_contains_tracing_config():
    """Priority 3: Check index.ts for OTLP HTTP exporter configuration."""
    index_ts = os.path.join(PROJECT_DIR, "index.ts")
    with open(index_ts) as f:
        content = f.read()

    assert "localhost:4318/v1/traces" in content, \
        "Expected OTLP HTTP exporter pointing to localhost:4318/v1/traces in index.ts"
    assert "experimental_telemetry" in content or "telemetry" in content or "OTLPTraceExporter" in content, \
        "Expected telemetry initialization logic in index.ts"


def test_npm_start_executes_successfully():
    """Priority 1: Run the script and verify it produces output.log.

    The agent's script typically initializes an OTel tracer/SDK that holds
    Node's event loop open beyond the work we actually care about. Run in
    the background and poll for the side-effect (output.log being written
    or refreshed); tear the process down once it lands.
    """
    prior_mtime = os.path.getmtime(LOG_FILE) if os.path.isfile(LOG_FILE) else 0.0

    proc = subprocess.Popen(
        ["npm", "start"],
        cwd=PROJECT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        preexec_fn=os.setsid,
    )

    deadline = time.monotonic() + NPM_START_TIMEOUT_SEC
    side_effect_seen = False
    early_exit_code = None
    try:
        while time.monotonic() < deadline:
            if os.path.isfile(LOG_FILE):
                mtime = os.path.getmtime(LOG_FILE)
                size = os.path.getsize(LOG_FILE)
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
                f"'npm start' exited with code {early_exit_code} before "
                f"producing {LOG_FILE}.\nstdout: {stdout!r}\nstderr: {stderr!r}"
            )
        pytest.fail(
            f"{LOG_FILE} was not produced/refreshed within "
            f"{NPM_START_TIMEOUT_SEC}s.\nstdout: {stdout!r}\nstderr: {stderr!r}"
        )


def test_output_log_exists():
    """Priority 3: Check if the log file was created."""
    assert os.path.isfile(LOG_FILE), f"Log file not found at {LOG_FILE}"
    assert os.path.getsize(LOG_FILE) > 0, "Log file is empty"
