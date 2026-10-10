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

# -------------------------------------------------------------
# Function: Delete Repository
# -------------------------------------------------------------
delete_repository() {
  clear
  echo "${RED}================================================================${RESET}"
  echo "${RED}${BOLD}               🗑️  DELETE GITHUB REPOSITORY                     ${RESET}"
  echo "${RED}================================================================${RESET}"
  echo ""

  GITHUB_USER="Anil1310"
  TARGET_DIR="${CALLING_PROJECT_DIR:-$CURRENT_DIR}"
  CURRENT_REPO=""

  # Detect current repo from git remote
  if [[ -d "$TARGET_DIR/.git" ]]; then
    REMOTE_URL=$(git -C "$TARGET_DIR" remote get-url origin 2>/dev/null)
    if [[ -n "$REMOTE_URL" ]]; then
      CURRENT_REPO=$(basename -s .git "$REMOTE_URL" 2>/dev/null)
    fi
  fi
  if [[ -z "$CURRENT_REPO" && -n "$TARGET_DIR" && "$TARGET_DIR" != "$HOME" && "$TARGET_DIR" != "$HOME/Desktop" ]]; then
    CURRENT_REPO=$(basename "$TARGET_DIR")
  fi

  echo "${CYAN}📡 Fetching repositories from GitHub (@$GITHUB_USER)...${RESET}"

  REPOS_STR=$(python3 -c "
import urllib.request, json
try:
    req = urllib.request.Request('https://api.github.com/users/$GITHUB_USER/repos?per_page=100&sort=updated', headers={'User-Agent': 'GitHubAutomation'})
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode())
        for r in data:
            name = r.get('name', '').strip()
            if name:
                print(name)
except Exception:
    pass
")

  typeset -a REPOS
  if [[ -n "$REPOS_STR" ]]; then
    REPOS=("${(@f)REPOS_STR}")
  fi

  echo ""
  REPO_NAME=""

  if [[ $#REPOS -gt 0 ]]; then
    echo "${BOLD}Select a repository to delete:${RESET}"
    echo ""
    for i in {1..$#REPOS}; do
      R_NAME="${REPOS[$i]}"
      if [[ -n "$CURRENT_REPO" && "$R_NAME" == "$CURRENT_REPO" ]]; then
        echo "  ${GREEN}[$i]${RESET} ${BOLD}$R_NAME${RESET}  ${CYAN}(📍 Current Project)${RESET}"
      else
        echo "  ${GREEN}[$i]${RESET} $R_NAME"
      fi
    done
    echo ""
    echo "  ${YELLOW}[m]${RESET} Enter repository name manually"
    echo "  ${RED}[b]${RESET} Back to main menu"
    echo ""
    printf "${YELLOW}${BOLD}Enter choice (1-$#REPOS, m, b): ${RESET}"
    read -r REPO_CHOICE

    if [[ "$REPO_CHOICE" == "b" || "$REPO_CHOICE" == "B" ]]; then
      return
    elif [[ "$REPO_CHOICE" == "m" || "$REPO_CHOICE" == "M" ]]; then
      printf "${YELLOW}Enter repo name: ${RESET}"
      read -r REPO_NAME
    elif [[ "$REPO_CHOICE" =~ ^[0-9]+$ ]] && (( REPO_CHOICE >= 1 && REPO_CHOICE <= $#REPOS )); then
      REPO_NAME="${REPOS[$REPO_CHOICE]}"
    elif [[ -n "$REPO_CHOICE" ]]; then
      REPO_NAME="$REPO_CHOICE"
    fi
  else
    echo "${YELLOW}Could not auto-fetch repositories (offline or private).${RESET}"
    if [[ -n "$CURRENT_REPO" ]]; then
      printf "${YELLOW}Enter repo name to delete (press [ENTER] for '${BOLD}$CURRENT_REPO${RESET}${YELLOW}', or 'b' to go back): ${RESET}"
    else
      printf "${YELLOW}Enter repo name to delete (or 'b' to go back): ${RESET}"
    fi
    read -r REPO_INPUT
    if [[ "$REPO_INPUT" == "b" || "$REPO_INPUT" == "B" ]]; then
      return
    fi
    REPO_NAME="${REPO_INPUT:-$CURRENT_REPO}"
  fi

  if [[ -z "$REPO_NAME" ]]; then
    echo "${RED}❌ No repository specified.${RESET}"
    sleep 1.5
    return
  fi

  echo ""
  echo "${RED}${BOLD}================================================================${RESET}"
  echo "${YELLOW}⚠️  WARNING: You are about to permanently delete:${RESET}"
  echo "    👉 ${BOLD}${RED}$GITHUB_USER/$REPO_NAME${RESET}"
  echo "${RED}${BOLD}================================================================${RESET}"
  echo ""
  printf "${RED}Type the exact repo name (${BOLD}$REPO_NAME${RESET}${RED}) to confirm deletion: ${RESET}"
  read -r CONFIRM_NAME

  if [[ "$CONFIRM_NAME" != "$REPO_NAME" ]]; then
    echo ""
    echo "${GREEN}Action cancelled. Repository was NOT deleted.${RESET}"
    sleep 2
    return
  fi

  echo ""
  echo "${CYAN}Choose deletion method:${RESET}"
  echo "  ${GREEN}[1]${RESET} 🌐 Open GitHub Settings in browser directly to Danger Zone (Recommended)"
  echo "  ${GREEN}[2]${RESET} ⚡ Instant Delete via GitHub Token / API"
  printf "${YELLOW}Enter choice (1-2): ${RESET}"
  read -r DEL_CHOICE

  if [[ "$DEL_CHOICE" == "2" ]]; then
    echo ""
    echo "${DIM}Note: Requires a GitHub Personal Access Token with 'delete_repo' scope.${RESET}"
    printf "${YELLOW}Paste GitHub Access Token: ${RESET}"
    read -rs GH_TOKEN
    echo ""
    if [[ -z "$GH_TOKEN" ]]; then
      echo "${RED}❌ Token cannot be empty.${RESET}"
    else
      echo "${CYAN}Deleting repository $GITHUB_USER/$REPO_NAME via GitHub API...${RESET}"
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
        -H "Authorization: token $GH_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$GITHUB_USER/$REPO_NAME")

      if [[ "$HTTP_CODE" == "204" ]]; then
        echo "${GREEN}✅ Repository '$GITHUB_USER/$REPO_NAME' deleted successfully from GitHub!${RESET}"
      else
        echo "${RED}❌ Failed to delete. HTTP status: $HTTP_CODE (Verify token has 'delete_repo' permission).${RESET}"
      fi
    fi
  else
    SETTINGS_URL="https://github.com/$GITHUB_USER/$REPO_NAME/settings#danger-zone"
    echo ""
    echo "${CYAN}Opening $SETTINGS_URL in your browser...${RESET}"
    open "$SETTINGS_URL"
    echo ""
    echo "${BOLD}In your browser:${RESET}"
    echo "1. Scroll down to the ${RED}Danger Zone${RESET} at the bottom."
    echo "2. Click '${RED}Delete this repository${RESET}' and confirm."
  fi

  # Ask to unlink local Git repo
  if [[ -d "$TARGET_DIR/.git" ]]; then
    echo ""
    printf "${YELLOW}Do you also want to remove local Git tracking (.git) from this folder? (y/N): ${RESET}"
    read -r REMOVE_LOCAL
    if [[ "$REMOVE_LOCAL" == "y" || "$REMOVE_LOCAL" == "Y" ]]; then
      rm -rf "$TARGET_DIR/.git"
      echo "${GREEN}✅ Local Git tracking removed!${RESET}"
    fi
  fi

  echo ""
  printf "${DIM}Press any key to return to menu...${RESET}"
  read -k 1
}

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
  echo "  ${RED}[5]${RESET} 🗑️  ${BOLD}Delete Repository${RESET}"
  echo "      ${DIM}Permanently delete a repository on GitHub & unlink locally${RESET}"
  echo ""
  echo "  ${RED}[6]${RESET} ❌ ${BOLD}Exit${RESET}"
  echo ""
  echo "${MAGENTA}----------------------------------------------------------------${RESET}"
  printf "${YELLOW}${BOLD}Enter choice (1-6): ${RESET}"
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
    5)
      delete_repository
      ;;
    6|q|Q|exit|Exit)
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
      echo "${RED}Invalid choice. Please enter 1, 2, 3, 4, 5, or 6.${RESET}"
      sleep 1.5
      ;;
  esac
done
