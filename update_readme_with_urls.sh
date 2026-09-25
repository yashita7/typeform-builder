#!/bin/bash

# Script to update README.md with deployment URLs
# Usage: ./update_readme_with_urls.sh "https://your-vercel-url.vercel.app"

if [ -z "$1" ]; then
  echo "❌ Error: Vercel URL required"
  echo ""
  echo "Usage: ./update_readme_with_urls.sh \"https://your-app.vercel.app\""
  echo ""
  exit 1
fi

VERCEL_URL="$1"

# Remove trailing slash if present
VERCEL_URL="${VERCEL_URL%/}"

echo "📝 Updating README.md with deployment URL..."
echo "   Vercel URL: $VERCEL_URL"
echo ""

# Backup README
cp README.md README.md.backup

# Update README.md
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s|\\*\\*Live Demo\\*\\*:.*|**Live Demo**: $VERCEL_URL|" README.md
else
  # Linux
  sed -i "s|\\*\\*Live Demo\\*\\*:.*|**Live Demo**: $VERCEL_URL|" README.md
fi

echo "✅ README.md updated!"
echo ""
echo "Changes made:"
diff README.md.backup README.md || echo "  Updated Live Demo URL"
echo ""
echo "Next steps:"
echo "  1. Review changes: cat README.md | head -10"
echo "  2. Commit: git add README.md"
echo "  3. Push: git commit -m \"Add live demo URL\" && git push"
echo ""
