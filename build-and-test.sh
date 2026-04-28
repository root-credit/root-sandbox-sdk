#!/bin/bash

# Navigate to roosterwise directory
cd /vercel/share/v0-project/roosterwise

# Build the app
echo "[v0] Building Roosterwise app..."
npm run build

# Check build status
if [ $? -eq 0 ]; then
    echo "[v0] Build successful! App is ready for deployment."
else
    echo "[v0] Build failed. Check errors above."
    exit 1
fi
