#!/bin/zsh
clear
echo "\033[1;36m========================================================\033[0m"
echo "\033[1;32m         📥 GITHUB AUTOMATION: CLONE REPOSITORY         \033[0m"
echo "\033[1;36m========================================================\033[0m"
echo ""
echo "Enter your repository name (e.g. my-app) OR paste a full git URL:"
printf "\033[1;33mRepository: \033[0m"
read REPO_INPUT

REPO_INPUT=$(echo "$REPO_INPUT" | tr -d '[:space:]')

if [[ -z "$REPO_INPUT" ]]; then
  echo "\033[1;31mError: No repository specified.\033[0m"
  echo "Press any key to exit..."
  read -k 1
  exit 1
fi

# Determine clone URL
if [[ "$REPO_INPUT" == git@* || "$REPO_INPUT" == https://* ]]; then
  CLONE_URL="$REPO_INPUT"
else
  CLONE_URL="git@github.com:Anil1310/$REPO_INPUT.git"
fi

cd "$HOME/Desktop" || exit 1

echo ""
echo "Cloning $CLONE_URL into Desktop..."
git clone "$CLONE_URL"

if [[ $? -eq 0 ]]; then
  echo ""
  echo "\033[1;32m✅ Repository downloaded successfully to your Desktop!\033[0m"
  # Extract folder name
  FOLDER_NAME=$(basename "$CLONE_URL" .git)
  if [[ -d "$HOME/Desktop/$FOLDER_NAME" ]]; then
    open "$HOME/Desktop/$FOLDER_NAME"
  fi
else
  echo ""
  echo "\033[1;31m❌ Failed to clone repository. Verify the repository name exists.\033[0m"
fi

echo ""
printf "Press any key to close this window..."
read -k 1
