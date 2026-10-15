import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from savant_backend.services.backend_services import build_citations, build_context_text


def test_generation_context_preserves_pdf_page_numbers_in_retrieval_order():
    context = build_context_text([
        {"page_number": 6, "chunk_index": 0, "text": "Positional encoding represents order."},
        {"page_number": 1, "chunk_index": 2, "text": "The Transformer uses attention."},
    ])
    assert context.index("PDF page 6") < context.index("PDF page 1")
    assert "chunk 0" in context
    assert "Positional encoding represents order." in context


def test_empty_context_does_not_invent_evidence():
    assert build_context_text([]) == "No relevant context found."


def test_citation_snippet_shows_matching_passage_after_a_long_heading():
    text = "Table of unrelated measurements. " * 20 + "Positional encoding supplies sequence order."
    citation = build_citations([{"page_number": 6, "text": text}], "Explain positional encoding")[0]
    assert "Positional encoding supplies sequence order." in citation["snippet"]
    assert citation["page_number"] == 6
