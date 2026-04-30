.PHONY: dev backend frontend install models verify clean

# ── On Windows: run inside cmd.exe (GNU Make default on Win) ──────────────
SHELL := cmd.exe
.SHELLFLAGS := /C

dev:
	@start "NEXUS-backend" cmd /C "cd backend && .venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
	@cd frontend && npm run dev

backend:
	@cd backend && .venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000

frontend:
	@cd frontend && npm run dev

install:
	@cd backend && .venv\Scripts\activate && pip install -r requirements.txt
	@cd frontend && npm install

models:
	@cd backend && .venv\Scripts\activate && python scripts\download_weights.py

verify:
	@cd backend && .venv\Scripts\activate && python scripts\verify_offline.py

clean:
	@for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"
	@del /s /q *.pyc 2>nul || echo No .pyc files found
	@echo ✓ Cleaned
