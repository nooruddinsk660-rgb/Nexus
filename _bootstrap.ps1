# Create all directories
$dirs = @(
  'backend\routers', 'backend\models', 'backend\services',
  'backend\core',    'backend\utils',
  'frontend\src',
  'weights',
  'data\uploads', 'data\indexes', 'data\exports',
  'logs'
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Force -Path $d | Out-Null }

# Create all starter files
$files = @(
  'backend\main.py', 'backend\config.py', 'backend\requirements.txt',
  'backend\routers\__init__.py', 'backend\routers\query.py',
  'backend\routers\ingest.py',   'backend\routers\health.py',
  'backend\models\__init__.py',  'backend\models\schemas.py',
  'backend\services\__init__.py','backend\services\embedder.py',
  'backend\services\retriever.py','backend\services\llm.py',
  'backend\services\ingestion.py',
  'backend\core\__init__.py',    'backend\core\vector_store.py',
  'backend\core\audio.py',       'backend\core\ocr.py',
  '.env.local', 'Makefile', 'README.md'
)
foreach ($f in $files) {
  if (-not (Test-Path $f)) { New-Item -ItemType File -Force -Path $f | Out-Null }
}

Write-Host "`u{2713} NEXUS monorepo created"
