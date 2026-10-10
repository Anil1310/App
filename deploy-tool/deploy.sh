#!/bin/sh
":" //#; exec /usr/bin/env node "$0" "$@"

/**
 * ============================================================================
 * ONE-CLICK AUTOMATION: GitHub Repo + Push + Netlify Deploy + Browser Launch
 * ============================================================================
 * Drop this file (deploy.sh) into ANY web project directory and run:
 *   ./deploy.sh
 *
 * What it does:
 * 1. Prompts for GitHub & Netlify tokens on first run (saved in ~/.automate-deploy.json).
 * 2. Initializes Git & .gitignore if not present, and commits changes.
 * 3. Creates the GitHub repository automatically and pushes to 'main'.
 * 4. Creates and deploys the site to Netlify with a public URL.
 * 5. Automatically launches the live Netlify website in your browser!
 * ============================================================================
 */

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const readline = require("node:readline");
const { execSync, spawnSync } = require("node:child_process");

const CONFIG_PATH = path.join(os.homedir(), ".automate-deploy.json");
const PROJECT_DIR = process.cwd();

// ANSI Colors
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m"
};

function log(msg, color = C.reset) {
  console.log(`${color}${msg}${C.reset}`);
}

function prompt(questionText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(questionText, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function runCmd(command, opts = {}) {
  try {
    return execSync(command, { cwd: PROJECT_DIR, stdio: "pipe", encoding: "utf8", ...opts }).trim();
  } catch (err) {
    if (opts.ignoreError) return null;
    throw err;
  }
}

// ----------------------------------------------------------------------------
// 1. CONFIG & CREDENTIALS MANAGEMENT
// ----------------------------------------------------------------------------
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    } catch (_) {}
  }
  return {};
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), { mode: 0o600 });
}

async function verifyGithubToken(token) {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Automate-Deploy-Script",
        Accept: "application/vnd.github.v3+json"
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.login;
  } catch (_) {
    return null;
  }
}

async function verifyNetlifyToken(token) {
  try {
    const res = await fetch("https://api.netlify.com/api/v1/user", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.email || data.slug || "verified";
  } catch (_) {
    return null;
  }
}

async function ensureCredentials() {
  let cfg = loadConfig();
  let updated = false;

  log("\n🔐 Checking Authentication Credentials...", C.bold + C.cyan);

  // GitHub Token
  let ghUser = cfg.githubToken ? await verifyGithubToken(cfg.githubToken) : null;
  if (!ghUser) {
    log("\n👉 GitHub Personal Access Token needed (required to auto-create repositories):", C.yellow);
    log("   1. Open: https://github.com/settings/tokens/new?scopes=repo&description=AutomateDeploy", C.dim);
    log("   2. Generate token with 'repo' scope and paste below.\n", C.dim);
    
    while (!ghUser) {
      const input = await prompt(`${C.bold}GitHub Token: ${C.reset}`);
      if (!input) {
        log("GitHub token cannot be empty.", C.red);
        continue;
      }
      ghUser = await verifyGithubToken(input);
      if (ghUser) {
        cfg.githubToken = input;
        cfg.githubUser = ghUser;
        updated = true;
        log(`✓ GitHub authenticated as @${ghUser}`, C.green);
      } else {
        log("❌ Invalid GitHub token. Please check scopes and try again.", C.red);
      }
    }
  } else {
    cfg.githubUser = ghUser;
    log(`✓ GitHub authenticated as @${ghUser}`, C.green);
  }

  // Netlify Token
  let netlifyUser = cfg.netlifyToken ? await verifyNetlifyToken(cfg.netlifyToken) : null;
  if (!netlifyUser) {
    log("\n👉 Netlify Personal Access Token needed (required to deploy & publish):", C.yellow);
    log("   1. Open: https://app.netlify.com/user/applications#personal-access-tokens", C.dim);
    log("   2. Click 'New access token', generate, and paste below.\n", C.dim);

    while (!netlifyUser) {
      const input = await prompt(`${C.bold}Netlify Access Token: ${C.reset}`);
      if (!input) {
        log("Netlify token cannot be empty.", C.red);
        continue;
      }
      netlifyUser = await verifyNetlifyToken(input);
      if (netlifyUser) {
        cfg.netlifyToken = input;
        cfg.netlifyUser = netlifyUser;
        updated = true;
        log(`✓ Netlify authenticated (${netlifyUser})`, C.green);
      } else {
        log("❌ Invalid Netlify token. Please try again.", C.red);
      }
    }
  } else {
    log(`✓ Netlify authenticated (${netlifyUser})`, C.green);
  }

  if (updated) {
    saveConfig(cfg);
    log(`💾 Credentials securely saved to ${CONFIG_PATH} (reused across all your projects)\n`, C.dim);
  }

  return cfg;
}

// ----------------------------------------------------------------------------
// 2. GIT SETUP & COMMIT
// ----------------------------------------------------------------------------
function ensureGit() {
  log("\n📦 Setting up Git Repository...", C.bold + C.cyan);

  // Check .gitignore
  const gitignorePath = path.join(PROJECT_DIR, ".gitignore");
  if (!fs.existsSync(gitignorePath)) {
    log("  Creating default .gitignore...", C.dim);
    fs.writeFileSync(
      gitignorePath,
      "node_modules/\n.DS_Store\n*.log\n.env\n.env.*\ndeploy-*.zip\n.netlify/\n"
    );
  }

  // Check if Git repo initialized
  const isGit = fs.existsSync(path.join(PROJECT_DIR, ".git"));
  if (!isGit) {
    log("  Initializing local git repository...", C.dim);
    runCmd("git init -b main");
  } else {
    // Ensure current branch is main
    try {
      const branch = runCmd("git rev-parse --abbrev-ref HEAD", { ignoreError: true });
      if (branch !== "main") {
        runCmd("git branch -M main", { ignoreError: true });
      }
    } catch (_) {}
  }

  // Stage and commit
  runCmd("git add .");
  const status = runCmd("git status --porcelain", { ignoreError: true });
  if (status) {
    const folderName = path.basename(PROJECT_DIR);
    runCmd(`git commit -m "Automated deploy: ${folderName}"`);
    log("  ✓ Committed local changes to Git", C.green);
  } else {
    log("  ✓ Working tree is clean", C.dim);
  }
}

// ----------------------------------------------------------------------------
// 3. GITHUB REPOSITORY CREATION & PUSH
// ----------------------------------------------------------------------------
function getSanitizedName() {
  return path.basename(PROJECT_DIR)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "my-web-project";
}

async function ensureGithubRepoAndPush(cfg, repoName) {
  log("\n🐙 Syncing with GitHub...", C.bold + C.cyan);

  const existingRemote = runCmd("git remote get-url origin", { ignoreError: true });
  let repoUrl = "";

  if (existingRemote) {
    log(`  Remote 'origin' already configured: ${existingRemote}`, C.dim);
    repoUrl = existingRemote.replace(/\.git$/, "");
  } else {
    log(`  Creating repository '${repoName}' on GitHub...`, C.dim);
    const res = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.githubToken}`,
        "User-Agent": "Automate-Deploy-Script",
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        name: repoName,
        private: false,
        description: "Automated project deployment"
      })
    });

    if (res.status === 201) {
      const data = await res.json();
      repoUrl = data.html_url;
      log(`  ✓ Created new repository: ${repoUrl}`, C.green);
    } else if (res.status === 422) {
      log(`  Repository '${repoName}' already exists on your account. Connecting...`, C.yellow);
      repoUrl = `https://github.com/${cfg.githubUser}/${repoName}`;
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`GitHub repo creation failed: ${errData.message || res.statusText}`);
    }

    // Set remote origin with token
    const authenticatedRemote = `https://${cfg.githubToken}@github.com/${cfg.githubUser}/${repoName}.git`;
    runCmd(`git remote add origin "${authenticatedRemote}"`);
  }

  // Push code
  log("  Pushing code to origin main...", C.dim);
  try {
    runCmd("git push -u origin main");
    log("  ✓ Successfully pushed to GitHub", C.green);
  } catch (err) {
    // If fast-forward rejected, offer force push or retry
    log("  Initial push requires force update...", C.yellow);
    runCmd("git push -u origin main --force");
    log("  ✓ Force pushed to GitHub main", C.green);
  }

  return repoUrl;
}

// ----------------------------------------------------------------------------
// 4. NETLIFY DEPLOYMENT VIA DIRECT API
// ----------------------------------------------------------------------------
async function deployToNetlify(cfg, siteName) {
  log("\n🌐 Deploying to Netlify...", C.bold + C.cyan);

  // 1. Check or create Netlify site
  let siteId = null;
  let siteUrl = null;

  // Check if .netlify-site.json exists locally in this project
  const siteConfigPath = path.join(PROJECT_DIR, ".netlify-site.json");
  if (fs.existsSync(siteConfigPath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(siteConfigPath, "utf8"));
      siteId = cached.siteId;
      siteUrl = cached.siteUrl;
    } catch (_) {}
  }

  if (!siteId) {
    log(`  Creating/locating Netlify site '${siteName}'...`, C.dim);
    let createRes = await fetch("https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.netlifyToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: siteName })
    });

    if (createRes.ok) {
      const siteData = await createRes.json();
      siteId = siteData.id;
      siteUrl = siteData.ssl_url || siteData.url;
      log(`  ✓ Created Netlify site: ${siteUrl}`, C.green);
    } else if (createRes.status === 422) {
      // Name is taken on Netlify, try fetching user's existing sites
      log(`  Site name '${siteName}' taken. Checking if it belongs to your account...`, C.dim);
      const userSitesRes = await fetch("https://api.netlify.com/api/v1/sites", {
        headers: { Authorization: `Bearer ${cfg.netlifyToken}` }
      });
      if (userSitesRes.ok) {
        const sites = await userSitesRes.json();
        const found = sites.find(s => s.name === siteName);
        if (found) {
          siteId = found.id;
          siteUrl = found.ssl_url || found.url;
          log(`  ✓ Found existing site in your Netlify account: ${siteUrl}`, C.green);
        }
      }

      // If still not found, create with random suffix
      if (!siteId) {
        const altName = `${siteName}-${Date.now().toString().slice(-5)}`;
        log(`  Creating site with unique name '${altName}'...`, C.dim);
        createRes = await fetch("https://api.netlify.com/api/v1/sites", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cfg.netlifyToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name: altName })
        });
        if (createRes.ok) {
          const siteData = await createRes.json();
          siteId = siteData.id;
          siteUrl = siteData.ssl_url || siteData.url;
        } else {
          // Create unnamed site (Netlify assigns a fun random subdomain)
          createRes = await fetch("https://api.netlify.com/api/v1/sites", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${cfg.netlifyToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({})
          });
          const siteData = await createRes.json();
          siteId = siteData.id;
          siteUrl = siteData.ssl_url || siteData.url;
        }
      }
    }

    // Cache siteId for future fast updates
    if (siteId) {
      fs.writeFileSync(siteConfigPath, JSON.stringify({ siteId, siteUrl, name: siteName }, null, 2));
    }
  }

  if (!siteId) {
    throw new Error("Could not acquire a Netlify site ID.");
  }

  // 2. Create lightweight zip of the project
  const zipPath = path.join(os.tmpdir(), `netlify-deploy-${Date.now()}.zip`);
  log("  Packaging project bundle...", C.dim);
  runCmd(`zip -q -r "${zipPath}" . -x "node_modules/*" ".git/*" "*.zip" "*.log" ".netlify-site.json"`);

  const zipBuffer = fs.readFileSync(zipPath);
  fs.unlinkSync(zipPath); // clean up temp file

  // 3. Upload deploy to Netlify
  log(`  Uploading ${Math.round(zipBuffer.length / 1024)} KB payload to Netlify CDN...`, C.dim);
  const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.netlifyToken}`,
      "Content-Type": "application/zip"
    },
    body: zipBuffer
  });

  if (!deployRes.ok) {
    const errText = await deployRes.text();
    throw new Error(`Netlify deployment upload failed: ${errText}`);
  }

  const deployData = await deployRes.json();
  const liveUrl = deployData.ssl_url || siteUrl;
  log(`  ✓ Deployment Published Successfully!`, C.green);

  return liveUrl;
}

// ----------------------------------------------------------------------------
// 5. OPEN IN BROWSER
// ----------------------------------------------------------------------------
function openBrowser(url) {
  try {
    if (process.platform === "darwin") {
      runCmd(`open "${url}"`);
    } else if (process.platform === "win32") {
      runCmd(`start "${url}"`);
    } else {
      runCmd(`xdg-open "${url}"`);
    }
    log(`  ✓ Opened ${url} in default browser`, C.green);
  } catch (_) {
    log(`  (Note: Open ${url} in your browser)`, C.dim);
  }
}

// ----------------------------------------------------------------------------
// MAIN EXECUTION
// ----------------------------------------------------------------------------
async function main() {
  console.log(`
${C.bold}${C.magenta}================================================================${C.reset}
${C.bold}${C.cyan}  🚀 FULL AUTOMATION: GITHUB + NETLIFY ONE-CLICK DEPLOY${C.reset}
${C.bold}${C.magenta}================================================================${C.reset}
  Project Folder: ${C.bold}${PROJECT_DIR}${C.reset}
`);

  try {
    const cfg = await ensureCredentials();
    const repoName = getSanitizedName();

    ensureGit();
    const githubUrl = await ensureGithubRepoAndPush(cfg, repoName);
    const netlifyUrl = await deployToNetlify(cfg, repoName);

    log("\n🎉 ALL DONE! Your project is live!", C.bold + C.green);
    console.log(`
----------------------------------------------------------------
🐙 GitHub Repository : ${C.bold}${C.cyan}${githubUrl}${C.reset}
🌐 Live Netlify URL  : ${C.bold}${C.green}${netlifyUrl}${C.reset}
----------------------------------------------------------------
`);

    log("Opening live website in your browser...", C.cyan);
    openBrowser(netlifyUrl);

  } catch (err) {
    console.error(`\n${C.bold}${C.red}❌ Error:${C.reset} ${err.message}\n`);
    process.exit(1);
  }
}

main();
