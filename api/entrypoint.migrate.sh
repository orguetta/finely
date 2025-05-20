#!/bin/sh

echo "⏳ Waiting for PostgreSQL to be ready..."
/usr/local/bin/wait-for-it.sh 192.168.0.18:5432 --timeout=30 --strict -- echo "✅ Database is up!"

echo "🚀 Running migrations..."
uv run manage.py migrate