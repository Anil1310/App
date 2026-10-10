#!/bin/zsh
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
if [[ -f "$SCRIPT_DIR/_GitHub Automation/Start_Automation.command" ]]; then
  exec "$SCRIPT_DIR/_GitHub Automation/Start_Automation.command"
else
  exec "$SCRIPT_DIR/GitHub Automation/Start_Automation.command"
fi
