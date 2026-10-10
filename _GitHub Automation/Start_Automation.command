#!/bin/zsh

CURRENT_DIR=$(cd "$(dirname "$0")" && pwd)

# -------------------------------------------------------------
# 1. SMART LAUNCHER MODE
# If 1_Create_New_Repository.command is NOT next to this script,
# we are running inside a project folder!
# Locate the central _GitHub Automation suite on Desktop and launch it.
# -------------------------------------------------------------
if [[ ! -f "$CURRENT_DIR/1_Create_New_Repository.command" ]]; then
  export CALLING_PROJECT_DIR="$CURRENT_DIR"

  AUTOMATION_DIR=""
  if [[ -d "$HOME/Desktop/_GitHub Automation" ]]; then
    AUTOMATION_DIR="$HOME/Desktop/_GitHub Automation"
  elif [[ -d "$HOME/Desktop/GitHub Automation" ]]; then
    AUTOMATION_DIR="$HOME/Desktop/GitHub Automation"
  elif [[ -d "$CURRENT_DIR/_GitHub Automation" ]]; then
    AUTOMATION_DIR="$CURRENT_DIR/_GitHub Automation"
  elif [[ -d "$CURRENT_DIR/GitHub Automation" ]]; then
    AUTOMATION_DIR="$CURRENT_DIR/GitHub Automation"
  elif [[ -d "$HOME/_GitHub Automation" ]]; then
    AUTOMATION_DIR="$HOME/_GitHub Automation"
  fi

  if [[ -z "$AUTOMATION_DIR" || ! -f "$AUTOMATION_DIR/Start_Automation.command" ]]; then
    clear
    echo "\033[1;31m========================================================\033[0m"
    echo "\033[1;31m   ❌ ERROR: '_GitHub Automation' FOLDER NOT FOUND      \033[0m"
    echo "\033[1;31m========================================================\033[0m"
    echo ""
    echo "This launcher connects to your central automation suite on Desktop:"
    echo "👉 \033[1;33m$HOME/Desktop/_GitHub Automation\033[0m"
    echo ""
    echo "Please make sure the '_GitHub Automation' folder is on your Desktop."
    echo ""
    printf "Press any key to exit..."
    read -k 1
    exit 1
  fi

  exec "$AUTOMATION_DIR/Start_Automation.command"
fi

# -------------------------------------------------------------
# 2. MASTER CONTROL CENTER MODE
# Running directly from the _GitHub Automation suite!
# -------------------------------------------------------------
SCRIPT_DIR="$CURRENT_DIR"
export CALLED_FROM_MENU=1

# Color Codes
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
MAGENTA='\033[1;35m'
BLUE='\033[1;34m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# Set Terminal Window Title
printf "\033]2;GitHub & Netlify Automation\007"

while true; do
  clear
  echo "${MAGENTA}================================================================${RESET}"
  echo "${CYAN}${BOLD}       🚀 GITHUB & NETLIFY AUTOMATION CONTROL CENTER            ${RESET}"
  echo "${DIM}            Account: Anil1310 (Anil Kumar Chahar)               ${RESET}"
  if [[ -n "$CALLING_PROJECT_DIR" && -d "$CALLING_PROJECT_DIR" && "$CALLING_PROJECT_DIR" != "$SCRIPT_DIR" && "$CALLING_PROJECT_DIR" != "$HOME" && "$CALLING_PROJECT_DIR" != "$HOME/Desktop" ]]; then
    PROJ_NAME=$(basename "$CALLING_PROJECT_DIR")
    echo "${MAGENTA}----------------------------------------------------------------${RESET}"
    echo "  ${CYAN}📁 Working Project:${RESET} ${BOLD}${GREEN}$PROJ_NAME${RESET}"
    echo "  ${DIM}Path: $CALLING_PROJECT_DIR${RESET}"
  fi
  echo "${MAGENTA}================================================================${RESET}"
  echo ""
  echo "${BOLD}What would you like to do?${RESET}"
  echo ""
  echo "  ${GREEN}[1]${RESET} 🚀 ${BOLD}Create New Repository${RESET}"
  echo "      ${DIM}Init Git, create GitHub repo, push code & deploy to Netlify${RESET}"
  echo ""
  echo "  ${GREEN}[2]${RESET} ⚡ ${BOLD}Quick Push Changes${RESET}"
  echo "      ${DIM}Stage, commit, push edits to GitHub & update live Netlify site${RESET}"
  echo ""
  echo "  ${GREEN}[3]${RESET} 🌐 ${BOLD}Deploy Project to Netlify (1-Click)${RESET}"
  echo "      ${DIM}Instantly upload & publish any project to a live .netlify.app URL${RESET}"
  echo ""
  echo "  ${GREEN}[4]${RESET} 📥 ${BOLD}Clone Existing Repository${RESET}"
  echo "      ${DIM}Download any repository from GitHub to your Desktop${RESET}"
  echo ""
  echo "  ${RED}[5]${RESET} ❌ ${BOLD}Exit${RESET}"
  echo ""
  echo "${MAGENTA}----------------------------------------------------------------${RESET}"
  printf "${YELLOW}${BOLD}Enter choice (1-5): ${RESET}"
  read -r CHOICE

  case "$CHOICE" in
    1)
      echo ""
      "$SCRIPT_DIR/1_Create_New_Repository.command"
      ;;
    2)
      echo ""
      "$SCRIPT_DIR/2_Quick_Push_Changes.command"
      ;;
    3)
      echo ""
      "$SCRIPT_DIR/4_Deploy_To_Netlify.command"
      ;;
    4)
      echo ""
      "$SCRIPT_DIR/3_Clone_Repository.command"
      ;;
    5|q|Q|exit|Exit)
      echo ""
      echo "${GREEN}Quitting Terminal... Goodbye! 👋${RESET}"
      sleep 0.3
      osascript -e 'tell application "Terminal" to quit' &>/dev/null &
      sleep 0.2
      killall Terminal 2>/dev/null
      exit 0
      ;;
    *)
      echo ""
      echo "${RED}Invalid choice. Please enter 1, 2, 3, 4, or 5.${RESET}"
      sleep 1.5
      ;;
  esac
done
