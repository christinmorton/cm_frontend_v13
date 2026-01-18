# Quick Start Checklist

Use this checklist to get your CI/CD pipeline running.

## One-Time Setup (Do Once)

### Local Machine
- [ ] Generate deploy key:
  ```bash
  ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key
  ```

### Frontend Server
- [ ] SSH into server and add public key:
  ```bash
  cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  ```
- [ ] Verify deploy directory exists and has correct permissions:
  ```bash
  sudo mkdir -p /var/www/christinmorton.com/public
  sudo chown -R $USER:www-data /var/www/christinmorton.com/public
  ```

### GitHub Repository
- [ ] Create new repository (or use existing)
- [ ] Go to Settings → Secrets and variables → Actions
- [ ] Add these secrets:
  - [ ] `SSH_PRIVATE_KEY` = contents of `~/.ssh/github_deploy_key`
  - [ ] `SSH_HOST` = `christinmorton.com`
  - [ ] `SSH_USER` = your ssh username
  - [ ] `SSH_PORT` = `22`
  - [ ] `DEPLOY_PATH` = `/var/www/christinmorton.com/public`

### Project Files
- [ ] Copy `.github/workflows/deploy.yml` to your project
- [ ] Update `VITE_API_URL` in workflow if different
- [ ] Commit and push:
  ```bash
  git add .github/
  git commit -m "Add CI/CD workflow"
  git push origin main
  ```

## Verify It's Working

- [ ] Check GitHub Actions tab for green checkmark
- [ ] Visit `https://christinmorton.com` to confirm deployment
- [ ] Make a small change, push, verify it deploys automatically

## Later: Add Staging (Optional)

- [ ] Set up staging server
- [ ] Add staging secrets (STAGING_SSH_HOST, etc.)
- [ ] Use `ci-cd-pipeline.yml` instead of `deploy.yml`
- [ ] Create `develop` branch for staging deployments

## Later: Add Chatbot Server

- [ ] Create new Digital Ocean droplet in same VPC
- [ ] Add deploy key to new server
- [ ] Create new GitHub repo for chatbot
- [ ] Copy `chatbot-template/.github/workflows/deploy.yml`
- [ ] Add chatbot-specific secrets
