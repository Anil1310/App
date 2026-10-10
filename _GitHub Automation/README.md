# 🚀 GitHub & Netlify 1-Click Automation Suite

**Owner:** Anil Kumar Chahar ([@Anil1310](https://github.com/Anil1310))  
**Platform:** macOS (Apple Silicon & Intel)  
**Location:** `Desktop/_GitHub Automation`

---

## 📌 Overview

This automation suite gives you a **zero-terminal, 1-click experience** for managing your GitHub repositories and publishing live websites to Netlify. 

You do **not** need to memorize Git commands or Netlify CLI syntax. Everything runs through interactive macOS `.command` scripts that you can launch with a simple double-click.

---

## 📂 Why the folder starts with `_`

The folder is named **`_GitHub Automation`** with a leading underscore because macOS Finder sorts symbols before letters. This ensures this folder always stays **pinned at the very top** of your Desktop and folder listings.

---

## ⚡ How to Use in Any Project (The 1-Step Workflow)

You do **not** need to copy the entire automation folder into each project!

```
Desktop/
├── _GitHub Automation/          <-- Keep this master folder centrally on Desktop
│   ├── Start_Automation.command
│   ├── 1_Create_New_Repository.command
│   ├── 2_Quick_Push_Changes.command
│   ├── 3_Clone_Repository.command
│   ├── 4_Deploy_To_Netlify.command
│   ├── helper_netlify.js
│   └── README.md
│
└── Any_Other_Project/           <-- Your project folder (e.g. Coaching Demo, Portfolio)
    └── Start_Automation.command <-- Just copy this single launcher file here!
```

### 🎯 Step-by-Step:
1. **Keep `_GitHub Automation` on your Desktop**.
2. **Copy `Start_Automation.command`** into any project folder you want to work on.
3. **Double-click `Start_Automation.command`** inside that project folder.
4. The script automatically:
   - Detects the current project folder name & path.
   - Connects to your central suite on Desktop.
   - Displays the **Working Project** right in the menu header.
   - When you select **Quick Push** or **Deploy to Netlify**, you can simply press **[ENTER]** without typing or dragging any folder paths!

---

## 🛠️ The Automation Tools

### 1. 🎛️ `Start_Automation.command` (Master Control Center)
- **What it does:** Displays an interactive menu to run any automation tool without closing the terminal.
- **Smart Launcher Mode:** If placed inside a project folder, it automatically acts as a bridge to your Desktop suite and remembers your project folder.
- **Quit Option:** Selecting option `5` automatically quits the Terminal window cleanly.

### 2. 🚀 `1_Create_New_Repository.command` (Create & Publish)
- **What it does:** Turns any project folder into a remote GitHub repository.
- **Workflow:**
  1. Automatically suggests the current folder name or asks for a new project name.
  2. Initializes Git (`main` branch) and links `git@github.com:Anil1310/<repo-name>.git`.
  3. Opens GitHub in your browser with the repo name pre-filled.
  4. Once you click **Create repository** on GitHub, press **[ENTER]** in Terminal.
  5. Automatically pushes your code and triggers an instant live deployment to Netlify!

### 3. ⚡ `2_Quick_Push_Changes.command` (Sync & Deploy)
- **What it does:** Saves all file edits and syncs them to GitHub and Netlify in seconds.
- **Workflow:**
  1. Shows detected changes (`git status`).
  2. Prompts for a commit message (or press **[ENTER]** for an automatic timestamp message).
  3. Stages all files (`git add .`), commits, and pushes to GitHub (`git push origin main`).
  4. Automatically asks if you want to push the update to your live Netlify website.

### 4. 🌐 `4_Deploy_To_Netlify.command` (1-Click Netlify Deploy)
- **What it does:** Publishes or updates any web project to a live public `.netlify.app` URL.
- **Workflow:**
  1. Bundles your project files (automatically excludes `.git`, `node_modules`, and temporary logs).
  2. Uploads directly to Netlify's Deploy API using your saved token.
  3. Prints the live URL (e.g., `https://your-site.netlify.app`) and automatically opens it in your default browser.

### 5. 📥 `3_Clone_Repository.command` (Download from GitHub)
- **What it does:** Downloads any repository from your GitHub account straight to your Desktop.
- **Workflow:**
  1. Type the repository name (e.g., `Portfolio` or `desktop-tutorial`).
  2. Clones via SSH and opens the downloaded folder in Finder.

---

## 🔑 Authentication & Security

All credentials are saved securely and permanently on your Mac:
- **GitHub SSH Key:** `~/.ssh/id_ed25519` (Linked to GitHub user `Anil1310`). You will never be asked for GitHub passwords or Personal Access Tokens.
- **Netlify API Token:** Stored in `~/.automate-deploy.json`. Runs completely hands-free without re-prompting.

---

## 💡 Quick Tips

- **Back to Menu:** In any prompt, you can type `b` or `0` and press **[ENTER]** to cancel and return to the main menu.
- **Permissions:** If macOS ever complains that a script is not executable, open Terminal and run:
  ```bash
  chmod +x ~/Desktop/"_GitHub Automation"/*.command
  ```
- **Drag & Drop:** Whenever a script asks for a folder path, you can drag and drop any folder directly from Finder into the Terminal window.
