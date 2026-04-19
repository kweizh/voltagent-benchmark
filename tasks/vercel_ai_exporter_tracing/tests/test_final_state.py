import os
import subprocess
import json
import pytest

PROJECT_DIR = "/home/user/app"

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
    """Priority 1: Run the script and verify it executes successfully."""
    result = subprocess.run(
        ["npm", "start"],
        capture_output=True, text=True, cwd=PROJECT_DIR
    )
    assert result.returncode == 0, \
        f"'npm start' failed: {result.stderr}"

def test_output_log_exists():
    """Priority 3: Check if the log file was created."""
    log_file = os.path.join(PROJECT_DIR, "output.log")
    assert os.path.isfile(log_file), f"Log file not found at {log_file}"
    assert os.path.getsize(log_file) > 0, "Log file is empty"
