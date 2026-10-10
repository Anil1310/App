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
  red: "\x1b[31m"
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

function getSanitizedName(dir) {
  return path.basename(dir)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "my-web-site";
}

async function deploy(targetDir) {
  const token = await ensureNetlifyToken();
  const siteName = getSanitizedName(targetDir);

  console.log(`\n${C.cyan}${C.bold}🌐 Deploying to Netlify...${C.reset}`);
  console.log(`${C.dim}  Directory: ${targetDir}${C.reset}`);

  // 1. Locate or create site
  let siteId = null;
  let siteUrl = null;
  const siteConfigPath = path.join(targetDir, ".netlify-site.json");

  if (fs.existsSync(siteConfigPath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(siteConfigPath, "utf8"));
      siteId = cached.siteId;
      siteUrl = cached.siteUrl;
    } catch (_) {}
  }

  if (!siteId) {
    process.stdout.write("  Checking/creating Netlify site... ");
    let createRes = await fetch("https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: siteName })
    });

    if (createRes.ok) {
      const data = await createRes.json();
      siteId = data.id;
      siteUrl = data.ssl_url || data.url;
    } else if (createRes.status === 422) {
      // Check if it belongs to user
      const userSitesRes = await fetch("https://api.netlify.com/api/v1/sites", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userSitesRes.ok) {
        const sites = await userSitesRes.json();
        const found = sites.find(s => s.name === siteName);
        if (found) {
          siteId = found.id;
          siteUrl = found.ssl_url || found.url;
        }
      }

      if (!siteId) {
        // Fallback: create with timestamp or random subdomain
        const altName = `${siteName}-${Date.now().toString().slice(-4)}`;
        createRes = await fetch("https://api.netlify.com/api/v1/sites", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name: altName })
        });
        if (createRes.ok) {
          const data = await createRes.json();
          siteId = data.id;
          siteUrl = data.ssl_url || data.url;
        }
      }
    }

    if (siteId) {
      fs.writeFileSync(siteConfigPath, JSON.stringify({ siteId, siteUrl, name: siteName }, null, 2));
      console.log(`${C.green}Ready${C.reset}`);
    } else {
      throw new Error("Failed to register site with Netlify.");
    }
  }

  // 2. Zip directory
  const zipPath = path.join(os.tmpdir(), `netlify-${Date.now()}.zip`);
  process.stdout.write("  Packaging project bundle... ");
  execSync(
    `zip -q -r "${zipPath}" . -x "node_modules/*" ".git/*" "*.zip" "*.log" ".netlify-site.json" "GitHub Automation/*" "_GitHub Automation/*" "deploy-tool/*"`,
    { cwd: targetDir }
  );
  console.log(`${C.green}Done${C.reset}`);

  // 3. Upload deploy
  const zipBuffer = fs.readFileSync(zipPath);
  fs.unlinkSync(zipPath);

  process.stdout.write(`  Uploading payload (${Math.round(zipBuffer.length / 1024)} KB)... `);
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

  console.log(`\n${C.green}${C.bold}🎉 Published to Netlify:${C.reset}`);
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
