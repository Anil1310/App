# 🚀 One-Click Universal Deployment Tool (`deploy.sh`)

This folder contains the universal deployment script that you can copy to **any** of your current or future web projects.

---

## 📁 Exact File Location

- **Inside this project:** `deploy-tool/deploy.sh`
- **Full Path:** `/Users/anilkumarchahar/Desktop/Coaching Class Demo/deploy-tool/deploy.sh`

---

## 📋 How to Use It in Any Future Project

### Step 1: Copy `deploy.sh` to Your New Project

Whenever you create a new project folder (e.g. `My-New-Project`), run this in your terminal:

```bash
cp "/Users/anilkumarchahar/Desktop/Coaching Class Demo/deploy-tool/deploy.sh" "/path/to/My-New-Project/"
```

*(Or simply drag and drop `deploy.sh` from this `deploy-tool` folder into your new project folder in Finder).*

---

### Step 2: Run It

Open your terminal in that new project folder and execute:

```bash
./deploy.sh
```

---

## ⚙️ What Happens Automatically:

1. **Credentials**: Prompts for GitHub & Netlify tokens **only on the first run**, then remembers them permanently in `~/.automate-deploy.json`.
2. **Git**: Initializes git (if not already), creates `.gitignore`, and makes the commit.
3. **GitHub**: Auto-creates the remote repository on your GitHub account (`Anil1310`) and pushes the code to `main`.
4. **Netlify**: Packages the project, uploads it via Netlify API, and publishes the live site.
5. **Browser**: Automatically launches the live `.netlify.app` website in your browser!
