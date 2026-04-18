import os
import pytest

PROJECT_DIR = "/home/user/project"

def test_retriever_exports_chroma_retriever():
    retriever_path = os.path.join(PROJECT_DIR, "retriever.ts")
    assert os.path.isfile(retriever_path), f"retriever.ts not found at {retriever_path}"
    with open(retriever_path, "r") as f:
        content = f.read()
    assert "class ChromaRetriever" in content, "Expected `class ChromaRetriever` to be defined in retriever.ts"
    assert "export" in content, "Expected `ChromaRetriever` to be exported in retriever.ts"

def test_output_log_contains_answer():
    log_path = os.path.join(PROJECT_DIR, "output.log")
    assert os.path.isfile(log_path), f"output.log not found at {log_path}"
    with open(log_path, "r") as f:
        content = f.read().lower()
    assert "typescript framework" in content or "typescript" in content, "Expected output.log to contain facts retrieved from ChromaDB (e.g., "TypeScript framework")."
