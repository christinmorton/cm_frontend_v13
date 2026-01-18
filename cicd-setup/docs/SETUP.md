# CI/CD Setup Guide for Multi-Server Deployment

## Overview

This guide covers setting up CI/CD pipelines for your infrastructure:

- **Frontend Server**: Vite vanilla JS app at `christinmorton.com`
- **Backend Server**: WordPress at `cms.christinmorton.com` (managed by SpinupWP)
- **Future Chatbot Server**: AI assistant features

All servers are on the same Digital Ocean network, which enables fast internal communication.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           YOUR LOCAL MACHINE                             │
│                                                                          │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐             │
│   │  frontend/  │      │  wp-plugin/ │      │  chatbot/   │             │
│   │  (Vite)     │      │  (WP)       │      │  (Node.js)  │             │
│   └──────┬──────┘      └──────┬──────┘      └──────┬──────┘             │
└──────────┼─────────────────────┼─────────────────────┼───────────────────┘
           │                     │                     │
           │ git push            │ git push            │ git push
           ▼                     ▼                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              GITHUB                                      │
│                                                                          │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│   │ frontend repo   │  │ wp-plugin repo  │  │ chatbot repo    │         │
│   │ ├─ .github/     │  │ ├─ .github/     │  │ ├─ .github/     │         │
│   │ │  workflows/   │  │ │  workflows/   │  │ │  workflows/   │         │
│   │ └─ src/         │  │ └─ includes/    │  │ └─ src/         │         │
│   └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│            │                    │                    │                   │
│            │ Actions            │ Actions            │ Actions           │
│            │ (build+deploy)     │ (deploy)           │ (deploy+restart)  │
└────────────┼────────────────────┼────────────────────┼───────────────────┘
             │                    │                    │
             ▼                    ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     DIGITAL OCEAN NETWORK                              │
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │ VPS: Frontend    │  │ VPS: WordPress   │  │ VPS: Chatbot     │     │
│  │                  │  │                  │  │                  │     │
│  │ christinmorton   │  │ cms.christin     │  │ chat.christin    │     │
│  │ .com             │  │ morton.com       │  │ morton.com       │     │
│  │                  │  │                  │  │                  │     │
│  │ nginx + static   │  │ nginx + PHP      │  │ nginx + Node.js  │     │
│  │ files            │  │ (SpinupWP)       │  │ + PM2            │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                        │
│            Internal network communication (private IPs)                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Generate a Deployment SSH Key

You'll create a dedicated key pair for GitHub Actions (separate from your personal key).

### On your local machine:

```bash
# Generate a new key pair specifically for deployments
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key

# This creates:
#   ~/.ssh/github_deploy_key      (private key - goes to GitHub Secrets)
#   ~/.ssh/github_deploy_key.pub  (public key - goes to server)
```

### On your frontend server:

```bash
# SSH into your server
ssh your-user@christinmorton.com

# Add the public key to authorized_keys
echo "ssh-ed25519 AAAA... github-actions-deploy" >> ~/.ssh/authorized_keys

# Ensure proper permissions
chmod 600 ~/.ssh/authorized_keys
```

### Note on key reuse:
You can use the same deploy key across all your servers if they're all under your control. 
Just add the public key to each server's `~/.ssh/authorized_keys`.

---

## Step 2: Configure GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### For Simple Setup (Single Production Server):

| Secret Name        | Value                                          |
|--------------------|------------------------------------------------|
| `SSH_PRIVATE_KEY`  | Contents of `~/.ssh/github_deploy_key`         |
| `SSH_HOST`         | `christinmorton.com` or server IP              |
| `SSH_USER`         | Your SSH username                              |
| `SSH_PORT`         | `22` (or your custom port)                     |
| `DEPLOY_PATH`      | `/var/www/christinmorton.com/public`           |

### For Full Pipeline (Staging + Production):

| Secret Name           | Value                                       |
|-----------------------|---------------------------------------------|
| `SSH_PRIVATE_KEY`     | Contents of `~/.ssh/github_deploy_key`      |
| `PROD_SSH_HOST`       | `christinmorton.com`                        |
| `PROD_SSH_USER`       | Your SSH username                           |
| `PROD_SSH_PORT`       | `22`                                        |
| `PROD_DEPLOY_PATH`    | `/var/www/christinmorton.com/public`        |
| `STAGING_SSH_HOST`    | `staging.christinmorton.com` (if you have one) |
| `STAGING_SSH_USER`    | Your SSH username                           |
| `STAGING_SSH_PORT`    | `22`                                        |
| `STAGING_DEPLOY_PATH` | `/var/www/staging.christinmorton.com/public`|

### How to copy the private key:

```bash
# Display the private key (copy everything including BEGIN and END lines)
cat ~/.ssh/github_deploy_key

# It should look like:
# -----BEGIN OPENSSH PRIVATE KEY-----
# b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
# ...
# -----END OPENSSH PRIVATE KEY-----
```

---

## Step 3: Set Up Your Frontend Repository

### Directory structure:

```
frontend-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Simple deployment
│       └── ci-cd-pipeline.yml  # Full pipeline (choose one)
├── src/
│   ├── main.js
│   └── ...
├── public/
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

### Copy the workflow file:

Choose either:
- `deploy.yml` - Simple: just deploys on push to main
- `ci-cd-pipeline.yml` - Full: includes staging, manual deploys, PR checks

### Update your package.json:

```json
{
  "name": "frontend-app",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest run"
  }
}
```

---

## Step 4: Environment Variables

### Create `.env.example` (committed to repo):

```bash
# API Configuration
VITE_API_URL=https://cms.christinmorton.com/wp-json

# Feature flags
VITE_ENABLE_CHATBOT=false

# Analytics (optional)
VITE_GA_ID=
```

### In your workflow, environment variables are set during build:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_API_URL: https://cms.christinmorton.com/wp-json
    VITE_ENABLE_CHATBOT: true
```

### Access in your Vite app:

```javascript
// src/config.js
export const API_URL = import.meta.env.VITE_API_URL;
export const ENABLE_CHATBOT = import.meta.env.VITE_ENABLE_CHATBOT === 'true';
```

---

## Step 5: Development Workflow

### Branch Strategy:

```
main        → Production (christinmorton.com)
  │
  └── develop   → Staging (staging.christinmorton.com) [optional]
        │
        └── feature/xyz   → Your working branches
```

### Daily workflow:

```bash
# 1. Start a feature branch
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. Make changes, commit
git add .
git commit -m "Add new feature"

# 3. Push and create PR
git push -u origin feature/new-feature
# Create PR on GitHub: feature/new-feature → develop

# 4. After PR review and merge to develop
#    → Automatically deploys to staging

# 5. When ready for production, merge develop → main
#    → Automatically deploys to production
```

### If you don't need staging:

Just push directly to `main` and use the simple `deploy.yml` workflow:

```bash
git checkout main
git add .
git commit -m "Update feature"
git push origin main
# → Automatically deploys to production
```

---

## Step 6: Server Configuration

### Ensure your nginx serves from the correct directory:

```nginx
# /etc/nginx/sites-available/christinmorton.com
server {
    listen 80;
    server_name christinmorton.com www.christinmorton.com;
    root /var/www/christinmorton.com/public;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Set proper directory permissions:

```bash
# Ensure the deploy user can write to the web directory
sudo chown -R your-user:www-data /var/www/christinmorton.com/public
sudo chmod -R 755 /var/www/christinmorton.com/public
```

---

## Step 7: Adding the Chatbot Server (Future)

When you're ready to add the AI chatbot server:

1. **Create the server** on Digital Ocean in the same VPC
2. **Add the deploy public key** to the new server's authorized_keys
3. **Create a new GitHub repository** for the chatbot
4. **Copy the chatbot workflow template** to `.github/workflows/deploy.yml`
5. **Add secrets** to the new repository:
   - `SSH_PRIVATE_KEY` (same key)
   - `CHATBOT_SSH_HOST`
   - `CHATBOT_SSH_USER`
   - `CHATBOT_SSH_PORT`
   - `CHATBOT_APP_PATH`

### Internal communication between servers:

Since all servers are on the same Digital Ocean network, use private IPs:

```javascript
// In your frontend config
const CHATBOT_URL = 'http://10.xxx.xxx.xxx:3000';  // Private IP

// Or use internal DNS if configured
const CHATBOT_URL = 'http://chatbot.internal:3000';
```

---

## Troubleshooting

### Deployment fails with "Permission denied":

```bash
# On the server, check authorized_keys
cat ~/.ssh/authorized_keys

# Verify permissions
ls -la ~/.ssh/
# Should be: drwx------ (700) for .ssh/
# Should be: -rw------- (600) for authorized_keys
```

### rsync fails with "connection refused":

```bash
# Verify SSH port in secrets matches server
ssh -p YOUR_PORT user@host
```

### Build fails with "vite: not found":

```bash
# Make sure package.json has vite as devDependency
npm install vite --save-dev
```

### Changes not visible after deploy:

```bash
# Clear browser cache or check nginx caching
# On server:
sudo nginx -t && sudo systemctl reload nginx
```

---

## Quick Reference

### Manual deploy from GitHub:

1. Go to repository → Actions
2. Select "Deploy Frontend" or "CI/CD Pipeline"
3. Click "Run workflow"
4. Select branch and environment
5. Click "Run workflow"

### Check deployment status:

- GitHub → Actions → See workflow runs
- Green checkmark = success
- Red X = failed (click to see logs)

### Rollback to previous version:

```bash
# Find the previous commit
git log --oneline

# Create a revert commit
git revert HEAD
git push origin main
# This triggers a new deployment with the previous code
```

Or manually from GitHub:
1. Go to Actions
2. Find a previous successful run
3. Click "Re-run all jobs"

---

## Files Included

```
cicd-setup/
├── frontend/
│   └── .github/
│       └── workflows/
│           ├── deploy.yml           # Simple production deploy
│           └── ci-cd-pipeline.yml   # Full CI/CD with staging
├── chatbot-template/
│   └── .github/
│       └── workflows/
│           └── deploy.yml           # Template for chatbot server
└── docs/
    └── SETUP.md                     # This file
```

Copy the appropriate workflow files to your repository's `.github/workflows/` directory.
