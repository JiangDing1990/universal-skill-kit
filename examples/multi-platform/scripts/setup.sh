#!/bin/bash
# Setup script for multi-platform skill

echo "🚀 Setting up multi-platform skill..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be >= 18 (current: $NODE_VERSION)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if usk-cli is installed
if ! command -v usk &> /dev/null; then
    echo "📦 Installing @jiangding/usk-cli..."
    npm install -g @jiangding/usk-cli
else
    echo "✅ usk-cli is installed: $(usk --version)"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p dist/claude
mkdir -p dist/codex

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "  1. Run 'usk build' to build the skill"
echo "  2. Run 'usk build --watch' for development mode"
echo "  3. Check 'dist/' folder for outputs"
