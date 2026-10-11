#!/bin/zsh
CURRENT_DIR=$(cd "$(dirname "$0")" && pwd)
node "$CURRENT_DIR/helper_netlify.js" "$CURRENT_DIR" --delete
