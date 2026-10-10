#!/bin/zsh
clear
echo "\033[1;36m========================================================\033[0m"
echo "\033[1;32m       🚀 GITHUB AUTOMATION: CREATE NEW REPOSITORY      \033[0m"
echo "\033[1;36m========================================================\033[0m"
echo ""
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

if [[ -n "$CALLING_PROJECT_DIR" && -d "$CALLING_PROJECT_DIR" && "$CALLING_PROJECT_DIR" != "$SCRIPT_DIR" && "$CALLING_PROJECT_DIR" != "$HOME" && "$CALLING_PROJECT_DIR" != "$HOME/Desktop" ]]; then
  DEFAULT_NAME=$(basename "$CALLING_PROJECT_DIR")
  echo "Current project folder: \033[1;32m$DEFAULT_NAME\033[0m ($CALLING_PROJECT_DIR)"
  printf "\033[1;33mEnter repo name (press [ENTER] for '$DEFAULT_NAME', or 'b' to go back): \033[0m"
  read REPO_NAME
  REPO_NAME=$(echo "$REPO_NAME" | tr -d '[:space:]')
  if [[ "$REPO_NAME" == "b" || "$REPO_NAME" == "B" || "$REPO_NAME" == "0" ]]; then
    exit 0
  fi
  if [[ -z "$REPO_NAME" ]]; then
    REPO_NAME="$DEFAULT_NAME"
  fi
  PROJECT_DIR="$CALLING_PROJECT_DIR"
else
  printf "\033[1;33mEnter project/repo name (e.g. my-app, or 'b' to go back): \033[0m"
  read REPO_NAME
  REPO_NAME=$(echo "$REPO_NAME" | tr -d '[:space:]')
  if [[ "$REPO_NAME" == "b" || "$REPO_NAME" == "B" || "$REPO_NAME" == "0" ]]; then
    exit 0
  fi
  if [[ -z "$REPO_NAME" ]]; then
    echo "\033[1;31mError: Repository name cannot be empty.\033[0m"
    if [[ "$CALLED_FROM_MENU" == "1" ]]; then
      sleep 1.2
      exit 0
    fi
    echo "Press any key to exit..."
    read -k 1
    exit 1
  fi
  PROJECT_DIR="$HOME/Desktop/$REPO_NAME"
fi

if [[ -d "$PROJECT_DIR" ]]; then
  echo "\033[1;33mNotice: Using project folder '$PROJECT_DIR'...\033[0m"
  if [[ ! -f "$PROJECT_DIR/README.md" && ! -f "$PROJECT_DIR/readme.md" ]]; then
    echo "# $REPO_NAME" > "$PROJECT_DIR/README.md"
  fi
else
  mkdir -p "$PROJECT_DIR"
  echo "# $REPO_NAME" > "$PROJECT_DIR/README.md"
  echo "Created project folder at $PROJECT_DIR"
fi

cd "$PROJECT_DIR" || exit 1

if [[ ! -d ".git" ]]; then
  git init -b main
else
  git branch -M main
fi

git add .
git commit -m "Initial commit" 2>/dev/null || true
git remote remove origin 2>/dev/null || true
git remote add origin "git@github.com:Anil1310/$REPO_NAME.git"

echo ""
echo "\033[1;34mOpening GitHub in your browser to create the remote repository...\033[0m"
open "https://github.com/new?name=$REPO_NAME"

echo ""
echo "\033[1;32m>>> Step:\033[0m In your browser, just click the green \033[1m'Create repository'\033[0m button."
echo "    (Leave 'Add a README' unchecked since we already created one for you)."
echo ""
printf "\033[1;33mOnce you clicked 'Create repository', press [ENTER] here to upload your code: \033[0m"
read -r DUMMY

echo ""
echo "Uploading to GitHub..."
git push -u origin main

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

if [[ $? -eq 0 ]]; then
  echo ""
  echo "\033[1;32m🎉 SUCCESS! Your repository is live at:\033[0m"
  echo "👉 https://github.com/Anil1310/$REPO_NAME"
  open "https://github.com/Anil1310/$REPO_NAME"

  echo ""
  echo "\033[1;36m========================================================\033[0m"
  echo "\033[1;32m         🌐 NETLIFY AUTOMATION: PUBLISHING LIVE SITE     \033[0m"
  echo "\033[1;36m========================================================\033[0m"
  node "$SCRIPT_DIR/helper_netlify.js" "$PROJECT_DIR"
  open "$PROJECT_DIR"
else
  echo ""
  echo "\033[1;31mPush encountered an issue. Please verify you clicked 'Create repository' on GitHub.\033[0m"
fi

echo ""
if [[ "$CALLED_FROM_MENU" == "1" ]]; then
  printf "\033[1;36mPress [ENTER] to return to Main Menu... \033[0m"
  read -r DUMMY
else
  printf "Press any key to close this window..."
  read -k 1
fi
exit 0
