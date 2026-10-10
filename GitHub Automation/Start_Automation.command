#!/bin/zsh

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

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

while true; do
  clear
  echo "${MAGENTA}================================================================${RESET}"
  echo "${CYAN}${BOLD}       🚀 GITHUB & NETLIFY AUTOMATION CONTROL CENTER            ${RESET}"
  echo "${DIM}            Account: Anil1310 (Anil Kumar Chahar)               ${RESET}"
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
      echo "${GREEN}Goodbye! 👋${RESET}"
      exit 0
      ;;
    *)
      echo ""
      echo "${RED}Invalid choice. Please enter 1, 2, 3, 4, or 5.${RESET}"
      sleep 1.5
      ;;
  esac
done
