#!/bin/zsh
clear
echo "\033[1;36m========================================================\033[0m"
echo "\033[1;32m         🌐 NETLIFY AUTOMATION: 1-CLICK DEPLOY           \033[0m"
echo "\033[1;36m========================================================\033[0m"
echo ""
echo "Drag & drop your project folder into this window and press [ENTER]"
echo "(or just press [ENTER] to deploy the current folder):"
printf "\033[1;33mFolder path: \033[0m"
read TARGET_FOLDER

# Remove quotes or trailing slashes added by macOS drag-and-drop
TARGET_FOLDER=$(echo "$TARGET_FOLDER" | sed -e "s/^'//" -e "s/'$//" -e 's/^"//' -e 's/"$//' -e 's/\\//g')

if [[ "$TARGET_FOLDER" == "b" || "$TARGET_FOLDER" == "B" || "$TARGET_FOLDER" == "0" ]]; then
  exit 0
fi

if [[ -z "$TARGET_FOLDER" ]]; then
  # Use parent directory of this script if placed inside a project
  SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
  PARENT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
  TARGET_FOLDER="$PARENT_DIR"
fi

if [[ ! -d "$TARGET_FOLDER" ]]; then
  echo "\033[1;31mError: Directory '$TARGET_FOLDER' does not exist.\033[0m"
  if [[ "$CALLED_FROM_MENU" == "1" ]]; then
    sleep 1.2
    exit 0
  fi
  echo "Press any key to exit..."
  read -k 1
  exit 1
fi

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
node "$SCRIPT_DIR/helper_netlify.js" "$TARGET_FOLDER"

echo ""
if [[ "$CALLED_FROM_MENU" == "1" ]]; then
  printf "\033[1;36mPress [ENTER] to return to Main Menu... \033[0m"
  read -r DUMMY
else
  printf "Press any key to close this window..."
  read -k 1
fi
exit 0
