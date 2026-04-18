
import os
import subprocess

def test_final_state():
    result = subprocess.run(['pnpm', 'test'], cwd='/workspace/voltagent', capture_output=True, text=True)
    assert result.returncode == 0, f'Tests failed: {result.stdout}'
    assert 'toolCalls' in result.stdout or 'Gemini' in result.stdout, 'Should have tested Gemini tool results'
