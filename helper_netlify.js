#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const readline = require("node:readline");
const { execSync } = require("node:child_process");

const targetFolder = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const CONFIG_PATH = path.join(os.homedir(), ".automate-deploy.json");

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

async function verifyNetlifyToken(token) {
  try {
    const res = await fetch("https://api.netlify.com/api/v1/user", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.email || data.slug || "verified";
  } catch (_) {
    return null;
  }
}

async function ensureNetlifyToken() {
  const cfg = loadConfig();
  let user = cfg.netlifyToken ? await verifyNetlifyToken(cfg.netlifyToken) : null;
  if (!user) {
    console.log(`\n${C.yellow}👉 Netlify Personal Access Token needed:${C.reset}`);
    console.log(`   1. Open: https://app.netlify.com/user/applications#personal-access-tokens`);
    console.log(`   2. Click 'New access token', copy it, and paste below:\n`);

    while (!user) {
      const input = await prompt(`${C.bold}Netlify Access Token: ${C.reset}`);
      if (!input) continue;
      user = await verifyNetlifyToken(input);
      if (user) {
        cfg.netlifyToken = input;
        cfg.netlifyUser = user;
        saveConfig(cfg);
        console.log(`${C.green}✓ Netlify authenticated (${user})${C.reset}\n`);
      } else {
        console.log(`${C.red}❌ Invalid token. Please try again.${C.reset}`);
      }
    }
  }
  return cfg.netlifyToken;
}

async function fetchUserSites(token) {
  process.stdout.write(`\n${C.cyan}📡 Fetching your Netlify projects... ${C.reset}`);
  const res = await fetch("https://api.netlify.com/api/v1/sites", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    console.log(`${C.red}Failed (HTTP ${res.status})${C.reset}`);
    throw new Error(`Could not retrieve sites from Netlify.`);
  }
  const sites = await res.json();
  console.log(`${C.green}Found ${sites.length} project(s)${C.reset}\n`);
  return sites;
}

async function deploy(targetDir) {
  const token = await ensureNetlifyToken();

  // 1. Fetch all existing projects from Netlify account
  const rawSites = await fetchUserSites(token);
  if (!rawSites || rawSites.length === 0) {
    throw new Error("No Netlify projects found in your account. Please create one on app.netlify.com first.");
  }

  // Check currently configured project in .netlify-site.json if present
  const siteConfigPath = path.join(targetDir, ".netlify-site.json");
  let currentSiteId = null;
  let currentSiteName = null;
  if (fs.existsSync(siteConfigPath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(siteConfigPath, "utf8"));
      currentSiteId = cached.siteId;
      currentSiteName = cached.name;
    } catch (_) {}
  }

  // Order sites so that currently linked project or divinecoach is placed at [1]
  const sitesList = [...rawSites].sort((a, b) => {
    const aIsCurrent = a.id === currentSiteId || a.name === currentSiteName || a.name === "divinecoach";
    const bIsCurrent = b.id === currentSiteId || b.name === currentSiteName || b.name === "divinecoach";
    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;
    return a.name.localeCompare(b.name);
  });

  // Display Interactive Prompt to the user
  console.log(`${C.magenta}================================================================${C.reset}`);
  console.log(`${C.cyan}${C.bold}       🌐 SELECT NETLIFY PROJECT TO PUBLISH / UPDATE            ${C.reset}`);
  console.log(`${C.dim}  Folder: ${targetDir}${C.reset}`);
  console.log(`${C.magenta}================================================================${C.reset}\n`);
  console.log(`${C.bold}Which project do you want to update?${C.reset}\n`);

  sitesList.forEach((site, idx) => {
    const num = idx + 1;
    const url = site.ssl_url || site.url;
    const isCurrent = (site.id === currentSiteId || site.name === currentSiteName);
    const badge = isCurrent ? ` ${C.cyan}${C.bold}(📍 Currently Linked)${C.reset}` : "";
    console.log(`  ${C.green}[${num}]${C.reset} ${C.bold}${site.name}${C.reset} ${C.dim}➔ ${url}${C.reset}${badge}`);
  });

  console.log(`\n  ${C.red}[c]${C.reset} Cancel deployment\n`);

  let chosenSite = null;
  while (!chosenSite) {
    const answer = await prompt(`${C.yellow}${C.bold}Enter choice (press [ENTER] for [1], or 1-${sitesList.length}, c): ${C.reset}`);
    const cleanAnswer = answer.trim();

    if (cleanAnswer === "c" || cleanAnswer === "C" || cleanAnswer === "0") {
      console.log(`\n${C.yellow}Deployment cancelled by user.${C.reset}\n`);
      return null;
    }

    if (cleanAnswer === "" || cleanAnswer === "1") {
      chosenSite = sitesList[0];
      break;
    }

    const parsedNum = parseInt(cleanAnswer, 10);
    if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= sitesList.length) {
      chosenSite = sitesList[parsedNum - 1];
      break;
    }

    // Also allow typing site name
    const byName = sitesList.find(s => s.name.toLowerCase() === cleanAnswer.toLowerCase());
    if (byName) {
      chosenSite = byName;
      break;
    }

    console.log(`${C.red}Invalid selection. Please enter a number between 1 and ${sitesList.length}, or 'c'.${C.reset}`);
  }

  const siteId = chosenSite.id;
  const siteUrl = chosenSite.ssl_url || chosenSite.url;
  const siteName = chosenSite.name;

  console.log(`\n${C.cyan}${C.bold}🚀 Target Project Selected: ${siteName}${C.reset}`);
  console.log(`${C.dim}  URL: ${siteUrl}${C.reset}`);

  // Save selected project to .netlify-site.json so it remembers it
  fs.writeFileSync(siteConfigPath, JSON.stringify({ siteId, siteUrl, name: siteName }, null, 2));

  // 2. Package bundle
  const zipPath = path.join(os.tmpdir(), `netlify-${Date.now()}.zip`);
  process.stdout.write(`\n  Packaging project bundle... `);
  execSync(
    `zip -q -r "${zipPath}" . -x "node_modules/*" ".git/*" "*.zip" "*.log" "GitHub Automation/*" "_GitHub Automation/*" "deploy-tool/*"`,
    { cwd: targetDir }
  );
  console.log(`${C.green}Done${C.reset}`);

  // 3. Upload deploy to chosen project
  const zipBuffer = fs.readFileSync(zipPath);
  fs.unlinkSync(zipPath);

  process.stdout.write(`  Uploading payload (${Math.round(zipBuffer.length / 1024)} KB) to ${siteName}... `);
  const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/zip"
    },
    body: zipBuffer
  });

  if (!deployRes.ok) {
    const errText = await deployRes.text();
    throw new Error(`Netlify upload failed: ${errText}`);
  }

  const deployData = await deployRes.json();
  const finalUrl = deployData.ssl_url || siteUrl;
  console.log(`${C.green}Live!${C.reset}`);

  console.log(`\n${C.green}${C.bold}🎉 Published to Netlify successfully:${C.reset}`);
  console.log(`👉 ${C.bold}${C.cyan}${finalUrl}${C.reset}\n`);

  try {
    execSync(`open "${finalUrl}"`);
    console.log(`${C.dim}Opened ${finalUrl} in your browser.${C.reset}\n`);
  } catch (_) {}

  return finalUrl;
}

deploy(targetFolder).catch(err => {
  console.error(`\n${C.red}❌ Netlify Deploy Error: ${err.message}${C.reset}\n`);
  process.exit(1);
});
