# Discord Bot Deployment - QNAP Container Station

This guide shows how to deploy the Discord bot using Docker in QNAP Container Station.

## Prerequisites

1. **QNAP Container Station** installed
   - Open QNAP App Center
   - Search for "Container Station"
   - Install Container Station

2. **Enable SSH** (for file transfer)
   - Control Panel → Telnet/SSH
   - Enable SSH

## Deployment Method 1: Using Docker Compose (Recommended)

### 1. Build Locally

```bash
# Build the TypeScript project
npm run build

# Build the Docker image
docker build --platform linux/amd64 -t discord-cube-bot .

# Save the image as a tar file
docker save discord-cube-bot:latest | gzip > discord-cube-bot-image.tar.gz
```

### 2. Transfer Files to QNAP

Create a directory on your QNAP and transfer files:

```bash
# Create deployment directory on QNAP
ssh admin@YOUR_QNAP_IP "mkdir -p /share/Container/discord-bot"

# Transfer files
scp discord-cube-bot-image.tar.gz admin@YOUR_QNAP_IP:/share/Container/discord-bot/
scp docker-compose.yml admin@YOUR_QNAP_IP:/share/Container/discord-bot/
scp .env.default admin@YOUR_QNAP_IP:/share/Container/discord-bot/
```

### 3. SSH into QNAP and Setup

```bash
ssh admin@YOUR_QNAP_IP

# Navigate to deployment directory
cd /share/Container/discord-bot

# Load the Docker image
docker load < discord-cube-bot-image.tar.gz

# Create .env file
cp .env.default .env
vi .env  # or nano .env

# Edit .env with your actual values:
# DISCORD_TOKEN=your-actual-token
# CLIENT_ID=your-actual-client-id
# GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
# GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
# SPREADSHEET_ID=your-spreadsheet-id
```

### 4. Start the Container

```bash
# Start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

## Deployment Method 2: Using Container Station UI

### 1. Build and Export Image Locally

```bash
npm run build
docker build --platform linux/amd64 -t discord-cube-bot .
docker save discord-cube-bot:latest -o discord-cube-bot.tar
```

### 2. Import Image via Container Station

1. Open Container Station
2. Go to **Images** tab
3. Click **Import** button
4. Upload `discord-cube-bot.tar`

### 3. Create Container via UI

1. Go to **Containers** tab
2. Click **Create**
3. Select your imported image `discord-cube-bot`
4. Configure:
   - **Name**: discord-cube-bot
   - **CPU/Memory**: Adjust as needed (512MB RAM is enough)
   - **Environment Variables**: Add all from `.env`:
     - DISCORD_TOKEN
     - CLIENT_ID
     - GOOGLE_SERVICE_ACCOUNT_EMAIL
     - GOOGLE_PRIVATE_KEY
     - SPREADSHEET_ID
   - **Restart Policy**: Always
5. Click **Create**

## Deployment Method 3: Build on QNAP (Advanced)

If you have enough resources on your QNAP:

```bash
# SSH into QNAP
ssh admin@YOUR_QNAP_IP

# Create directory
mkdir -p /share/Container/discord-bot
cd /share/Container/discord-bot

# Transfer source files
# (from local machine)
scp -r dist package*.json Dockerfile .env.default admin@YOUR_QNAP_IP:/share/Container/discord-bot/

# Back on QNAP, create .env
cp .env.default .env
vi .env  # Configure your secrets

# Build the image
docker build --platform linux/amd64 -t discord-cube-bot .

# Run the container
docker run -d \
  --name discord-cube-bot \
  --restart unless-stopped \
  --env-file .env \
  discord-cube-bot
```

## Managing the Container

### View Logs
```bash
# Via CLI
docker logs discord-cube-bot -f

# Via Container Station UI
Containers → discord-cube-bot → Logs
```

### Restart Container
```bash
# Via CLI
docker restart discord-cube-bot

# Via Container Station UI
Containers → discord-cube-bot → Restart
```

### Stop Container
```bash
# Via CLI
docker stop discord-cube-bot

# Via Container Station UI
Containers → discord-cube-bot → Stop
```

### Update the Bot

```bash
# 1. Build new image locally
npm run build
docker build --platform linux/amd64 -t discord-cube-bot .
docker save discord-cube-bot:latest | gzip > discord-cube-bot-image.tar.gz

# 2. Transfer to QNAP
scp discord-cube-bot-image.tar.gz admin@YOUR_QNAP_IP:/share/Container/discord-bot/

# 3. On QNAP
ssh admin@YOUR_QNAP_IP
cd /share/Container/discord-bot
docker load < discord-cube-bot-image.tar.gz
docker-compose down
docker-compose up -d
```

## Auto-start on QNAP Boot

Container Station containers with `restart: unless-stopped` or `--restart unless-stopped` will automatically start when Container Station starts.

To ensure Container Station starts on boot:
1. Go to QNAP Control Panel
2. Applications → Container Station
3. Enable "Enable Container Station on startup"

## Troubleshooting

### exec format error
If you see `exec format error`, the image was built for the wrong CPU architecture (e.g. ARM64 on Mac vs x86_64 on QNAP). Rebuild with `--platform linux/amd64`:
```bash
docker build --platform linux/amd64 -t discord-cube-bot .
```

### Container won't start
```bash
# Check logs
docker logs discord-cube-bot

# Inspect container
docker inspect discord-cube-bot

# Check if image exists
docker images | grep discord-cube-bot
```

### Environment variables not working
```bash
# Verify .env file
cat .env

# Check if env vars are set in container
docker exec discord-cube-bot env
```

### Memory issues
```bash
# Check container stats
docker stats discord-cube-bot

# Adjust memory limit in Container Station UI or docker-compose.yml
```

### Network issues
```bash
# Test from container
docker exec discord-cube-bot ping discord.com
docker exec discord-cube-bot wget -O- https://discord.com/api/v10/gateway
```

## Resource Requirements

**Minimum:**
- CPU: 0.5 cores
- RAM: 256MB
- Storage: 200MB

**Recommended:**
- CPU: 1 core
- RAM: 512MB
- Storage: 500MB

## Security Notes

- Never expose the container's port unless needed
- Keep `.env` file secure with proper permissions
- Use QNAP's firewall to protect Container Station
- Regularly update the Node.js base image
- Use QNAP's backup feature to backup the container

## Deploy Slash Commands

After first deployment, register slash commands:

```bash
# Via docker exec
docker exec discord-cube-bot node dist/deploy-commands.js

# Or temporarily run a new container
docker run --rm --env-file .env discord-cube-bot node dist/deploy-commands.js
```

## File Structure on QNAP

```
/share/Container/discord-bot/
├── discord-cube-bot-image.tar.gz  # Docker image
├── docker-compose.yml             # Compose configuration
├── .env                           # Your secrets
└── logs/                          # Optional log directory
```

## Monitoring

### View Container Status in Container Station
1. Open Container Station
2. Go to **Overview** for resource usage
3. Go to **Containers** to see running state
4. Click container name for detailed metrics

### Set up Notifications
1. Container Station → Settings
2. Enable notifications for container events
3. Configure email/SMS alerts

## Backup

### Backup Container Configuration
```bash
# Export container config
docker inspect discord-cube-bot > discord-cube-bot-config.json

# Backup .env file
cp .env .env.backup
```

### Backup via QNAP
1. Hybrid Backup Sync
2. Create backup job
3. Include `/share/Container/discord-bot/`
