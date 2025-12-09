.PHONY: run test verify install clean

install:
	uv sync

run:
	uv run uvicorn app.main:app --reload

test:
	uv run pytest

verify:
	uv run python verify_api.py

clean:
	rm -rf .venv
	find . -type d -name "__pycache__" -exec rm -rf {} +
