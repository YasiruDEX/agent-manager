#!/bin/bash
# run-ui.sh
# Starts the frontend UI dev server for the Event Logistics Agent.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/ui"

echo "Installing UI dependencies if needed..."
npm install --legacy-peer-deps

echo "Starting WSO2 Oxygen UI Development Server..."
npm run dev
