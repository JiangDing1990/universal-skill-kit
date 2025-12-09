#!/bin/bash
# Deploy script for multi-platform skill

set -e

echo "🚀 Deploying multi-platform skill..."

# Build the skill
echo "📦 Building skill..."
usk build --force

# Verify outputs
if [ ! -f "dist/claude/SKILL.md" ]; then
    echo "❌ Claude build failed"
    exit 1
fi

if [ ! -f "dist/codex/SKILL.md" ]; then
    echo "❌ Codex build failed"
    exit 1
fi

echo "✅ Builds verified"

# Copy to target directories
CLAUDE_TARGET="$HOME/.claude/skills/multi-platform"
CODEX_TARGET="$HOME/.codex/skills/multi-platform"

echo "📁 Deploying to target directories..."

# Deploy to Claude
if [ -d "$CLAUDE_TARGET" ]; then
    rm -rf "$CLAUDE_TARGET"
fi
mkdir -p "$CLAUDE_TARGET"
cp -r dist/claude/* "$CLAUDE_TARGET/"
echo "✅ Deployed to Claude: $CLAUDE_TARGET"

# Deploy to Codex
if [ -d "$CODEX_TARGET" ]; then
    rm -rf "$CODEX_TARGET"
fi
mkdir -p "$CODEX_TARGET"
cp -r dist/codex/* "$CODEX_TARGET/"
echo "✅ Deployed to Codex: $CODEX_TARGET"

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "Deployed locations:"
echo "  Claude: $CLAUDE_TARGET"
echo "  Codex:  $CODEX_TARGET"
