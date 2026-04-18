
import os
import subprocess

def test_initial_state():
    assert os.path.exists('/workspace/voltagent'), 'VoltAgent repository should be cloned in /workspace'
    assert os.path.exists('/workspace/voltagent/package.json'), 'package.json should exist'
