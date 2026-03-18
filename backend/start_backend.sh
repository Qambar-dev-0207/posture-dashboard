#!/bin/bash

# Start the Node.js API server in the background
echo "🚀 Starting Node.js API Server..."
cd /app/api-server && npm start &

# Start the Python Ingestion server
echo "🐍 Starting Python Ingestion Server..."
cd /app/ingestion-server && uvicorn main:app --host 0.0.0.0 --port 8000
