# 📘 Complete Guide & Conversation Summary: GitHub Setup & Portfolio Automation

**User:** Anil Kumar Chahar ([@Anil1310](https://github.com/Anil1310))  
**Date:** October 9, 2026  
**System:** macOS (Apple Silicon)

---

## 📌 Executive Summary of Achievements

During this session, we transformed your setup from having no linked GitHub repository to a fully automated development and deployment pipeline:

1. **Git & GitHub Authentication**: Configured your Git identity and generated a secure ED25519 SSH key permanently linking your Mac to GitHub.
2. **Desktop Automation Suite**: Created a 1-click folder on your Desktop (`Desktop/GitHub Automation`) containing double-clickable scripts to create, push, and clone repositories without typing terminal commands.
3. **Portfolio Repository**: Created your first repository, **Portfolio**, and pushed it live to GitHub.
4. **Custom Developer Portfolio Website**: Engineered a modern dark glassmorphic portfolio highlighting your work at Udaan.com, your skills (Python, SQL, Automation, Excel/VBA), and your projects.
5. **Free Hosting on GitHub Pages**: Deployed the site live on the internet at `https://anil1310.github.io/Portfolio/`.
6. **Project URL Integration**: Integrated your live Google Apps Script Cloud Web App with an interactive launcher.
7. **Netlify Guide**: Provided step-by-step instructions to connect GitHub to Netlify.

---

## 🔑 1. GitHub Account & SSH Authentication

Your Mac is now permanently authenticated with GitHub via SSH:
- **Git User Name**: `Anil Kumar Chahar`
- **Git Commit Email**: `68296835+Anil1310@users.noreply.github.com`
- **SSH Key Location**: `~/.ssh/id_ed25519`
- **Public Key**: Installed and verified on GitHub under `Settings -> SSH Keys`.
- **Status**: Tested and verified (`Hi Anil1310! You've successfully authenticated!`).
- **Benefit**: You will **never** be prompted for passwords or Personal Access Tokens when pulling or pushing.

---

## 🛠️ 2. Desktop Automation Tools

**Folder Location:** `Desktop/GitHub Automation`

Inside this folder are 3 double-clickable tools created specifically for your workflow:

### 🚀 `1_Create_New_Repository.command`
- **Purpose**: Creates a brand new repository from scratch and uploads it to GitHub.
- **Workflow**:
  1. Double-click the file.
  2. Type your project name (e.g. `Data-Pipeline`).
  3. It automatically creates the folder on your Desktop, initializes Git, creates a README, and opens GitHub in your browser with the name filled in.
  4. Click "Create repository" on GitHub, press Enter in the script, and your code is uploaded immediately.

### ⚡ `2_Quick_Push_Changes.command`
- **Purpose**: Saves and uploads your edits to GitHub in one step.
- **Workflow**:
  1. Double-click the file.
  2. Drag and drop any project folder from your Mac into the terminal window and hit Enter.
  3. It shows all changed files, creates an automatic commit snapshot, and pushes directly to GitHub!

### 📥 `3_Clone_Repository.command`
- **Purpose**: Downloads any repository from GitHub to your Desktop.
- **Workflow**:
  1. Double-click the file.
  2. Enter the repository name (e.g. `Portfolio`).
  3. It downloads the project to your Desktop and opens the folder in Finder.

---

## 🌐 3. Your Live Portfolio Website

### 🔗 Key Links:
- **GitHub Repository**: [https://github.com/Anil1310/Portfolio](https://github.com/Anil1310/Portfolio)
- **Live Website**: [https://anil1310.github.io/Portfolio/](https://anil1310.github.io/Portfolio/)
- **Local Source Code**: `Desktop/Portfolio/`

### 🎨 Features & Technologies Used:
- **Theme**: Dark glassmorphic cyber-aesthetic with ambient glowing orbs and animated particle starfield canvas.
- **Typography**: Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*).
- **Interactive Terminal**: Showcases your background as Data Analyst at Udaan.com, skills, and status.
- **Skills Matrix**: Visual skill bars for Data Analytics (SQL, Python), Automation (Apps Script, Excel/VBA), and Cloud/Web.
- **Projects Showcase**: Interactive cards featuring:
  - Enterprise Automated Reporting Engine
  - **Google Apps Script Enterprise Web App** *(Linked to your live URL)*
  - PDF 2 Excel Extraction Utility
- **Experience Timeline**: Highlighting your role at Udaan.com and automation history.

---

## 🔗 4. How to Add More Project URLs to Your Portfolio

To add new projects or update links:

1. Open `Desktop/Portfolio/index.html` in any text editor.
2. Locate the `<div class="projects-grid">` section (around line 180).
3. Under any card's `<div class="project-links">`, add:
   ```html
   <!-- Live Demo / Web App Link -->
   <a href="YOUR_URL_HERE" target="_blank" rel="noopener noreferrer" title="Open Live App">
     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
       <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
       <polyline points="15 3 21 3 21 9"></polyline>
       <line x1="10" y1="14" x2="21" y2="3"></line>
     </svg>
   </a>
   ```
4. Double-click `Desktop/GitHub Automation/2_Quick_Push_Changes.command` to push the update to your live site.

---

## ☁️ 5. Free Hosting on Netlify

Your website is already running for free on **GitHub Pages**, but if you also want a **Netlify** URL:

1. Visit: [https://app.netlify.com/start](https://app.netlify.com/start)
2. Click **GitHub** and grant authorization.
3. Select your repository: **`Portfolio`**.
4. Click **Deploy Portfolio**.
5. Netlify will build and provide a custom live link (e.g. `anil-portfolio.netlify.app`).

---

## 📝 6. Daily Git Cheat Sheet (For Reference)

If you ever want to run Git commands manually in the terminal:

```bash
# Navigate to project
cd ~/Desktop/Portfolio

# Check status of changed files
git status

# Stage all modified files
git add .

# Save snapshot with a descriptive message
git commit -m "Update project details"

# Upload to GitHub
git push origin main

# Download latest changes from GitHub
git pull origin main
```

---
*Created automatically by your AI Coding Assistant.*
