#!/bin/bash
# Musql Production Deploy Script
# Usage: ./deploy.sh

set -e

REMOTE="musql-prod"
REMOTE_DIR="~/musql-app"
LOCAL_DIR="/home/igiffrekt/projects/Musql-frontend"

echo "🚀 Deploying Musql to production..."

# Sync source files (excluding node_modules, .next, etc.)
echo "📦 Syncing files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'dev.db' \
  --exclude '.env.local' \
  --exclude '*.log' \
  "$LOCAL_DIR/" "$REMOTE:$REMOTE_DIR/"

# Run build on server (source nvm for npm access)
echo "🔨 Installing dependencies..."
ssh $REMOTE "source ~/.nvm/nvm.sh && cd $REMOTE_DIR && npm install --ignore-scripts"

echo "🔨 Building..."
ssh $REMOTE "source ~/.nvm/nvm.sh && cd $REMOTE_DIR && npm run build"

# Restart the app
echo "♻️ Restarting app..."
ssh $REMOTE "source ~/.nvm/nvm.sh && pkill -f 'next-server' 2>/dev/null || true"
sleep 2
ssh $REMOTE "source ~/.nvm/nvm.sh && cd $REMOTE_DIR && nohup npm start > /tmp/musql.log 2>&1 &"

# Wait and check
sleep 5
echo "✅ Checking status..."
ssh $REMOTE "ps aux | grep 'next-server' | grep -v grep && echo '🎉 Deploy complete!'"

echo ""
echo "🌐 App should be live at https://musql.app"
