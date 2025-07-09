#!/bin/bash

echo "🔄 Restarting Netlify Dev Server"
echo "This will stop any running dev servers and start fresh"

# Kill any existing netlify dev processes
echo "Stopping existing Netlify dev processes..."
pkill -f "netlify dev" || true

# Wait a moment
sleep 2

# Start the dev server
echo "Starting Netlify dev server..."
npm run dev
