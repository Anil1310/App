#!/bin/zsh
clear
echo "\033[1;36m========================================================\033[0m"
echo "\033[1;32m         ⚡ GITHUB AUTOMATION: QUICK SYNC / PUSH        \033[0m"
echo "\033[1;36m========================================================\033[0m"
echo ""
echo "Drag & drop your project folder into this window and press [ENTER]:"
printf "\033[1;33mFolder path: \033[0m"
read TARGET_FOLDER

# Remove quotes or trailing slashes added by macOS drag-and-drop
TARGET_FOLDER=$(echo "$TARGET_FOLDER" | sed -e "s/^'//" -e "s/'$//" -e 's/^"//' -e 's/"$//' -e 's/\\//g')

if [[ -z "$TARGET_FOLDER" ]]; then
  echo "\033[1;31mError: No folder provided.\033[0m"
  echo "Press any key to exit..."
  read -k 1
  exit 1
fi

if [[ ! -d "$TARGET_FOLDER" ]]; then
  echo "\033[1;31mError: Directory '$TARGET_FOLDER' does not exist.\033[0m"
  echo "Press any key to exit..."
  read -k 1
  exit 1
fi

cd "$TARGET_FOLDER" || exit 1

if [[ ! -d ".git" ]]; then
  echo "\033[1;31mError: This folder is not a Git repository.\033[0m"
  echo "Use '1_Create_New_Repository' first to turn it into a GitHub repository."
  echo "Press any key to exit..."
  read -k 1
  exit 1
fi

echo ""
echo "\033[1;34m--- Detected Changes in Project ---\033[0m"
git status -s
echo "-----------------------------------"
echo ""

printf "\033[1;33mCommit message (press [ENTER] for 'Auto update: $(date "+%Y-%m-%d %H:%M")'): \033[0m"
read COMMIT_MSG

if [[ -z "$COMMIT_MSG" ]]; then
  COMMIT_MSG="Auto update: $(date "+%Y-%m-%d %H:%M")"
fi

echo ""
echo "Staging files..."
git add .

echo "Creating commit: \"$COMMIT_MSG\""
git commit -m "$COMMIT_MSG"

# Detect current branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ -z "$CURRENT_BRANCH" ]]; then
  CURRENT_BRANCH="main"
fi

echo "Pushing to GitHub branch '$CURRENT_BRANCH'..."
git push origin "$CURRENT_BRANCH"

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

if [[ $? -eq 0 ]]; then
  echo ""
  echo "\033[1;32m✅ SUCCESS! All changes pushed to GitHub successfully.\033[0m"

  echo ""
  printf "\033[1;33mDeploy updated changes to Netlify now? [Y/n]: \033[0m"
  read -r DEPLOY_CHOICE
  if [[ -z "$DEPLOY_CHOICE" || "$DEPLOY_CHOICE" == "y" || "$DEPLOY_CHOICE" == "Y" ]]; then
    echo ""
    echo "\033[1;36m========================================================\033[0m"
    echo "\033[1;32m         🌐 NETLIFY AUTOMATION: UPDATING LIVE SITE       \033[0m"
    echo "\033[1;36m========================================================\033[0m"
    node "$SCRIPT_DIR/helper_netlify.js" "$TARGET_FOLDER"
  fi
else
  echo ""
  echo "\033[1;31m❌ Push failed. Check if remote origin is set or if you need to pull first.\033[0m"
fi

echo ""
printf "Press any key to close this window..."
read -k 1
