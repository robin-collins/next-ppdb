#!/bin/bash

# Check if we're on the main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" = "main" ]; then
  echo "🔨 On main branch - running build..."
  pnpm run build
else
  echo "✓ Not on main branch ($BRANCH) - skipping build"
  exit 0
fi
