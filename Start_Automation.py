#!/usr/bin/env python3
"""
🚀 GitHub & Netlify Automation Control Center
Runs directly inside IDE terminal or Mac Desktop Terminal.
"""

import os
import sys
import subprocess
import datetime
import shutil

# Color Codes
CYAN = "\033[1;36m"
GREEN = "\033[1;32m"
YELLOW = "\033[1;33m"
RED = "\033[1;31m"
MAGENTA = "\033[1;35m"
BLUE = "\033[1;34m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DESKTOP_DIR = os.path.expanduser("~/Desktop")


def get_current_project():
    """Detect current project directory."""
    calling = os.environ.get("CALLING_PROJECT_DIR")
    if calling and os.path.isdir(calling) and os.path.exists(os.path.join(calling, ".git")):
        return calling

    if os.path.exists(os.path.join(SCRIPT_DIR, ".git")):
        return SCRIPT_DIR

    # Check if we are in Coaching Demo or another Desktop folder
    current_cwd = os.getcwd()
    if os.path.exists(os.path.join(current_cwd, ".git")):
        return current_cwd

    # Default to Coaching Demo if found on Desktop
    coaching_demo = os.path.join(DESKTOP_DIR, "Coaching Demo")
    if os.path.exists(os.path.join(coaching_demo, ".git")):
        return coaching_demo

    return None


def list_desktop_projects():
    """List all Desktop git projects."""
    projects = []
    if os.path.isdir(DESKTOP_DIR):
        for entry in sorted(os.listdir(DESKTOP_DIR)):
            full_path = os.path.join(DESKTOP_DIR, entry)
            if os.path.isdir(full_path) and os.path.exists(os.path.join(full_path, ".git")):
                if entry not in ("GitHub Automation", "_GitHub Automation"):
                    projects.append(full_path)
    return projects


def select_project():
    """Select active working project."""
    current = get_current_project()
    projects = list_desktop_projects()

    if current and current not in projects:
        projects.insert(0, current)
    elif current in projects:
        # Move current to front
        projects.remove(current)
        projects.insert(0, current)

    if not projects:
        return current or os.getcwd()

    if len(projects) == 1:
        return projects[0]

    return projects[0]


def print_banner(project_path):
    proj_name = os.path.basename(project_path) if project_path else "Workspace"
    print(f"\n{MAGENTA}================================================================{RESET}")
    print(f"{CYAN}{BOLD}       🚀 GITHUB & NETLIFY AUTOMATION CONTROL CENTER            {RESET}")
    print(f"{DIM}            Account: Anil1310 (Anil Kumar Chahar)               {RESET}")
    print(f"{MAGENTA}----------------------------------------------------------------{RESET}")
    print(f"  {CYAN}📁 Active Project:{RESET} {BOLD}{GREEN}{proj_name}{RESET}")
    print(f"  {DIM}Path: {project_path}{RESET}")
    print(f"{MAGENTA}================================================================{RESET}\n")


def run_cmd(cmd, cwd=None, check=True):
    """Run shell command with streamed output."""
    try:
        proc = subprocess.run(cmd, shell=True, check=check, text=True, cwd=cwd)
        return proc.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"{RED}Error: {e}{RESET}")
        return False


def get_git_info(project_dir):
    """Get active branch and remote origin."""
    try:
        branch = subprocess.check_output("git branch --show-current", shell=True, text=True, cwd=project_dir).strip() or "main"
        remote = subprocess.check_output("git remote get-url origin", shell=True, text=True, cwd=project_dir).strip()
        return branch, remote
    except Exception:
        return "main", "git@github.com:Anil1310/App.git"


def quick_push(project_dir):
    """Stage, commit, push, and offer interactive Netlify deploy."""
    proj_name = os.path.basename(project_dir)
    branch, remote = get_git_info(project_dir)

    print(f"\n{CYAN}--------------------------------------------------------{RESET}")
    print(f"🚀 {BOLD}Auto-Pushing:{RESET} {GREEN}{proj_name}{RESET} -> {BLUE}{remote}{RESET}")
    print(f"{CYAN}--------------------------------------------------------{RESET}\n")

    print(f"{BLUE}--- Detected Changes ---{RESET}")
    subprocess.run("git status -s", shell=True, cwd=project_dir)
    print(f"{BLUE}------------------------{RESET}\n")

    print(f"{CYAN}Staging all files...{RESET}")
    run_cmd("git add .", cwd=project_dir)

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    commit_msg = f"Auto update: {now_str}"

    diff_check = subprocess.run("git diff-index --quiet HEAD --", shell=True, cwd=project_dir)
    if diff_check.returncode != 0:
        print(f"Creating commit: \"{commit_msg}\"")
        run_cmd(f'git commit -m "{commit_msg}"', cwd=project_dir)
    else:
        print(f"{GREEN}Working tree clean (no new file changes).{RESET}")

    print(f"\n{CYAN}🚀 Pushing to GitHub ({branch})...{RESET}")
    success = run_cmd(f"git push origin {branch}", cwd=project_dir)

    if success:
        print(f"\n{GREEN}{BOLD}🎉 SUCCESS! All changes pushed to GitHub successfully.{RESET}")

        print(f"\n{YELLOW}Deploy updated changes to Netlify now? [Y/n]: {RESET}", end="")
        try:
            choice = input().strip().lower()
        except EOFError:
            choice = "y"

        if choice in ("", "y", "yes"):
            deploy_netlify(project_dir)
    else:
        print(f"\n{RED}❌ Push failed. Please check remote origin.{RESET}")


def deploy_netlify(project_dir):
    """Run Netlify interactive project selector (1, 2, 3...)."""
    helper_path = os.path.join(project_dir, "helper_netlify.js")
    if not os.path.exists(helper_path):
        helper_path = os.path.join(DESKTOP_DIR, "GitHub Automation", "helper_netlify.js")

    if not os.path.exists(helper_path):
        print(f"{RED}Error: helper_netlify.js not found.{RESET}")
        return

    subprocess.run(["node", helper_path, project_dir])


def delete_netlify(project_dir):
    """Run Netlify interactive project deletion tool."""
    helper_path = os.path.join(project_dir, "helper_netlify.js")
    if not os.path.exists(helper_path):
        helper_path = os.path.join(DESKTOP_DIR, "GitHub Automation", "helper_netlify.js")

    if not os.path.exists(helper_path):
        print(f"{RED}Error: helper_netlify.js not found.{RESET}")
        return

    subprocess.run(["node", helper_path, project_dir, "--delete"])


def delete_github(project_dir):
    """Run GitHub interactive repository deletion tool."""
    helper_path = os.path.join(project_dir, "helper_github.js")
    if not os.path.exists(helper_path):
        helper_path = os.path.join(DESKTOP_DIR, "GitHub Automation", "helper_github.js")

    if not os.path.exists(helper_path):
        print(f"{RED}Error: helper_github.js not found.{RESET}")
        return

    subprocess.run(["node", helper_path])


def quick_pull(project_dir):
    """Pull latest updates from GitHub."""
    branch, remote = get_git_info(project_dir)
    proj_name = os.path.basename(project_dir)
    print(f"\n{CYAN}--------------------------------------------------------{RESET}")
    print(f"⬇️  {BOLD}Pulling updates for:{RESET} {GREEN}{proj_name}{RESET} ({branch})")
    print(f"   Remote: {remote}")
    print(f"{CYAN}--------------------------------------------------------{RESET}\n")

    run_cmd(f"git pull origin {branch}", cwd=project_dir)
    print(f"\n{GREEN}✅ SUCCESS! Local project '{proj_name}' is up to date.{RESET}")


def view_status(project_dir):
    """Display project and Netlify details."""
    proj_name = os.path.basename(project_dir)
    branch, remote = get_git_info(project_dir)

    print(f"\n{CYAN}--------------------------------------------------------{RESET}")
    print(f"📊 {BOLD}Project Information & Status{RESET}")
    print(f"{CYAN}--------------------------------------------------------{RESET}")
    print(f"  {BOLD}Project Name:{RESET}     {GREEN}{proj_name}{RESET}")
    print(f"  {BOLD}Directory:{RESET}        {project_dir}")
    print(f"  {BOLD}GitHub Remote:{RESET}    {remote}")
    print(f"  {BOLD}Current Branch:{RESET}   {branch}")
    print(f"  {BOLD}Primary Live URL:{RESET} {CYAN}https://divinecoach.netlify.app/{RESET}\n")

    print(f"{BOLD}Recent Commits:{RESET}")
    subprocess.run('git log -n 4 --format="  • %h | %s (%cr)"', shell=True, cwd=project_dir)

    print(f"\n{BOLD}Working Tree:{RESET}")
    subprocess.run("git status -s", shell=True, cwd=project_dir)


def view_status_and_switch(target_project):
    """Display project and Netlify details, with option to switch."""
    view_status(target_project)
    print(f"\n{YELLOW}Switch to another project? [y/N]: {RESET}", end="")
    try:
        ans = input().strip().lower()
    except (EOFError, KeyboardInterrupt):
        return target_project

    if ans in ("y", "yes"):
        all_projs = list_desktop_projects()
        print(f"\n{BOLD}Available Desktop Projects:{RESET}")
        for i, p in enumerate(all_projs, start=1):
            is_curr = f" {CYAN}(📍 Current){RESET}" if p == target_project else ""
            print(f"  [{i}] {os.path.basename(p)}{is_curr}")
        try:
            p_ans = input(f"\n{YELLOW}Choose project (1-{len(all_projs)}): {RESET}").strip()
            if p_ans.isdigit() and 1 <= int(p_ans) <= len(all_projs):
                target_project = all_projs[int(p_ans) - 1]
                print(f"{GREEN}Switched to: {os.path.basename(target_project)}{RESET}")
        except (EOFError, KeyboardInterrupt):
            pass
    return target_project


def main():
    target_project = select_project()

    while True:
        print_banner(target_project)
        print(f"{BOLD}What would you like to do?{RESET}\n")

        print(f"  {CYAN}{BOLD}--- 🐙 GITHUB AUTOMATION ---{RESET}")
        print(f"  {GREEN}[1]{RESET} ⚡ {BOLD}Quick Push to GitHub{RESET}     {DIM}(Stage, commit, push changes & optional deploy){RESET}")
        print(f"  {GREEN}[2]{RESET} ⬇️  {BOLD}Quick Pull from GitHub{RESET}   {DIM}(Pull latest commits from GitHub){RESET}")
        print(f"  {RED}[3]{RESET} 🗑️  {BOLD}Delete GitHub Repo{RESET}       {DIM}(Permanently delete GitHub repository){RESET}\n")

        print(f"  {CYAN}{BOLD}--- 🌐 NETLIFY AUTOMATION ---{RESET}")
        print(f"  {GREEN}[4]{RESET} 🚀 {BOLD}Deploy to Netlify{RESET}        {DIM}(Interactive 1, 2, 3 project selector){RESET}")
        print(f"  {RED}[5]{RESET} 🗑️  {BOLD}Delete Netlify Project{RESET}   {DIM}(Permanently remove unwanted Netlify site){RESET}\n")

        print(f"  {CYAN}{BOLD}--- ⚙️  WORKSPACE & EXIT ---{RESET}")
        print(f"  {GREEN}[6]{RESET} 📊 {BOLD}Project Info & Switch{RESET}    {DIM}(View branch, commits, or switch project){RESET}")
        print(f"  {RED}[7]{RESET} ❌ {BOLD}Exit{RESET}\n")

        try:
            choice = input(f"{YELLOW}{BOLD}Enter choice (1-7): {RESET}").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting...")
            break

        if choice == "1":
            quick_push(target_project)
        elif choice == "2":
            quick_pull(target_project)
        elif choice == "3":
            delete_github(target_project)
        elif choice == "4":
            deploy_netlify(target_project)
        elif choice == "5":
            delete_netlify(target_project)
        elif choice == "6":
            target_project = view_status_and_switch(target_project)
        elif choice in ("7", "q", "exit"):
            print(f"\n{GREEN}Goodbye! 👋{RESET}\n")
            break
        else:
            print(f"{RED}Invalid selection. Please choose 1 to 7.{RESET}")

        try:
            input(f"\n{DIM}Press [ENTER] to return to menu...{RESET}")
        except (EOFError, KeyboardInterrupt):
            break


if __name__ == "__main__":
    main()
