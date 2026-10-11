#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const readline = require("node:readline");
const { execSync } = require("node:child_process");

const CONFIG_PATH = path.join(os.homedir(), ".automate-deploy.json");
const GITHUB_USERNAME = "Anil1310";

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m"
};

function prompt(questionText) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(questionText, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

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
        "User-Agent": "Antigravity-Automation",
        Accept: "application/vnd.github+json"
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.login || "verified";
  } catch (_) {
    return null;
  }
}

async function fetchGithubRepos(token) {
  process.stdout.write(`\n${C.cyan}📡 Fetching GitHub repositories for ${GITHUB_USERNAME}... ${C.reset}`);
  let url = `https://api.github.com/user/repos?per_page=100&affiliation=owner&sort=updated`;
  const headers = {
    "User-Agent": "Antigravity-Automation",
    Accept: "application/vnd.github+json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      if (token) {
        // Try fallback without token
        const publicRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`, {
          headers: { "User-Agent": "Antigravity-Automation" }
        });
        if (publicRes.ok) {
          const repos = await publicRes.json();
          console.log(`${C.green}Found ${repos.length} repository(ies)${C.reset}\n`);
          return repos;
        }
      }
      console.log(`${C.yellow}Notice: Could not list repos automatically.${C.reset}\n`);
      return [];
    }
    const repos = await res.json();
    console.log(`${C.green}Found ${repos.length} repository(ies)${C.reset}\n`);
    return repos;
  } catch (err) {
    console.log(`${C.red}Error fetching repos: ${err.message}${C.reset}\n`);
    return [];
  }
}

async function deleteGithubRepoInteractive() {
  const cfg = loadConfig();
  let token = cfg.githubToken || null;

  while (true) {
    const repos = await fetchGithubRepos(token);

    console.log(`${C.magenta}================================================================${C.reset}`);
    console.log(`${C.red}${C.bold}       🗑️  DELETE GITHUB REPOSITORY (PERMANENT REMOVAL)         ${C.reset}`);
    console.log(`${C.dim}  Account: ${GITHUB_USERNAME}${C.reset}`);
    console.log(`${C.magenta}================================================================${C.reset}\n`);

    if (repos.length > 0) {
      console.log(`${C.bold}Select a GitHub repository to permanently delete:${C.reset}\n`);
      repos.forEach((repo, idx) => {
        const num = idx + 1;
        const priv = repo.private ? ` ${C.yellow}(🔒 Private)${C.reset}` : "";
        console.log(`  ${C.yellow}[${num}]${C.reset} ${C.bold}${repo.name}${C.reset}${priv} ${C.dim}➔ ${repo.html_url}${C.reset}`);
      });
      console.log(`\n  ${C.cyan}[d]${C.reset} Type repository name manually`);
      console.log(`  ${C.green}[c]${C.reset} Cancel / Return to menu\n`);
    } else {
      console.log(`${C.yellow}Type the name of the repository to delete (or 'c' to cancel):${C.reset}\n`);
    }

    const answer = await prompt(`${C.yellow}${C.bold}Enter choice (number, repo name, or 'c'): ${C.reset}`);
    const cleanAnswer = answer.trim();

    if (!cleanAnswer || cleanAnswer.toLowerCase() === "c" || cleanAnswer === "0" || cleanAnswer.toLowerCase() === "q") {
      console.log(`\n${C.green}Exited GitHub deletion tool.${C.reset}\n`);
      return;
    }

    let targetRepoName = "";

    const parsedNum = parseInt(cleanAnswer, 10);
    if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= repos.length) {
      targetRepoName = repos[parsedNum - 1].name;
    } else if (cleanAnswer.toLowerCase() === "d") {
      targetRepoName = await prompt(`${C.yellow}Enter repository name: ${C.reset}`);
    } else {
      targetRepoName = cleanAnswer;
    }

    targetRepoName = targetRepoName.replace(/^https?:\/\/github\.com\/[^/]+\//i, "").replace(/\.git$/i, "").trim();

    if (!targetRepoName) {
      console.log(`${C.red}Invalid repository name.${C.reset}\n`);
      continue;
    }

    console.log(`\n${C.red}${C.bold}⚠️  WARNING: You are about to PERMANENTLY delete:${C.reset}`);
    console.log(`  Repository: ${C.bold}${GITHUB_USERNAME}/${targetRepoName}${C.reset}`);
    console.log(`  URL:        https://github.com/${GITHUB_USERNAME}/${targetRepoName}\n`);

    const confirmAns = await prompt(`${C.yellow}${C.bold}Type 'yes' or '${targetRepoName}' to confirm deletion: ${C.reset}`);
    const cleanConfirm = confirmAns.trim().toLowerCase();

    if (cleanConfirm !== "yes" && cleanConfirm !== "y" && cleanConfirm !== targetRepoName.toLowerCase()) {
      console.log(`${C.yellow}Deletion cancelled for ${targetRepoName}.${C.reset}\n`);
      continue;
    }

    // Attempt deletion
    let deleted = false;

    // 1. Try using GitHub Token if already available
    if (token) {
      process.stdout.write(`\nDeleting repository via GitHub API... `);
      const delRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${targetRepoName}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "Antigravity-Automation",
          Accept: "application/vnd.github+json"
        }
      });

      if (delRes.status === 204 || delRes.status === 200) {
        console.log(`${C.green}Deleted! ✅${C.reset}\n`);
        console.log(`${C.green}Repository '${GITHUB_USERNAME}/${targetRepoName}' has been permanently deleted from GitHub.${C.reset}\n`);
        deleted = true;
      } else {
        const errJson = await delRes.text();
        console.log(`${C.yellow}API returned HTTP ${delRes.status} (token may lack delete_repo scope).${C.reset}`);
      }
    }

    // 2. If token is missing or didn't work, prompt user or open browser
    if (!deleted) {
      console.log(`\n${C.cyan}👉 GitHub Personal Access Token with 'delete_repo' scope needed to delete via API:${C.reset}`);
      console.log(`   1. Create token here: ${C.bold}https://github.com/settings/tokens/new?scopes=delete_repo,repo${C.reset}`);
      console.log(`   2. Or open repository settings in your browser directly to delete in 1-click.\n`);

      console.log(`  ${C.green}[1]${C.reset} Paste GitHub Personal Access Token`);
      console.log(`  ${C.cyan}[2]${C.reset} Open GitHub Danger Zone in browser to delete now`);
      console.log(`  ${C.yellow}[c]${C.reset} Cancel\n`);

      const methodChoice = await prompt(`${C.yellow}Enter option (1, 2, or c): ${C.reset}`);

      if (methodChoice.trim() === "1") {
        const inputToken = await prompt(`${C.bold}Paste GitHub Token (ghp_...): ${C.reset}`);
        if (inputToken) {
          const user = await verifyGithubToken(inputToken.trim());
          if (user) {
            token = inputToken.trim();
            cfg.githubToken = token;
            saveConfig(cfg);
            console.log(`${C.green}✓ GitHub token saved (${user})${C.reset}\n`);

            // Retry delete
            process.stdout.write(`Deleting repository via GitHub API... `);
            const delRes2 = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${targetRepoName}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "Antigravity-Automation",
                Accept: "application/vnd.github+json"
              }
            });

            if (delRes2.status === 204 || delRes2.status === 200) {
              console.log(`${C.green}Deleted! ✅${C.reset}\n`);
              console.log(`${C.green}Repository '${GITHUB_USERNAME}/${targetRepoName}' has been permanently deleted.${C.reset}\n`);
              deleted = true;
            } else {
              console.log(`${C.red}Failed: Ensure your token has the 'delete_repo' permission checkbox checked.${C.reset}\n`);
            }
          } else {
            console.log(`${C.red}Invalid GitHub token.${C.reset}\n`);
          }
        }
      } else if (methodChoice.trim() === "2") {
        const deleteUrl = `https://github.com/${GITHUB_USERNAME}/${targetRepoName}/settings#danger-zone`;
        console.log(`\n${C.cyan}Opening repository settings in your browser:${C.reset}`);
        console.log(`👉 ${deleteUrl}\n`);
        try {
          execSync(`open "${deleteUrl}"`);
        } catch (_) {}
      }
    }

    const moreAns = await prompt(`${C.yellow}Would you like to delete another GitHub repository? [y/N]: ${C.reset}`);
    if (moreAns.trim().toLowerCase() !== "y" && moreAns.trim().toLowerCase() !== "yes") {
      console.log(`\n${C.green}Finished GitHub repository cleanup.${C.reset}\n`);
      return;
    }
  }
}

deleteGithubRepoInteractive().catch(err => {
  console.error(`\n${C.red}❌ GitHub Error: ${err.message}${C.reset}\n`);
  process.exit(1);
});
