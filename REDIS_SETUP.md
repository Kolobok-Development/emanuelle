# Redis Setup for BullMQ

## 🚀 Quick Start with Docker

### 1. Install Docker (if not already installed)
```bash
# macOS
brew install docker

# Or download from https://www.docker.com/
```

### 2. Run Redis Container
```bash
docker run -d --name redis-emanuelle -p 6379:6379 redis:7-alpine
```

### 3. Verify Redis is Running
```bash
docker ps
# Should show redis container running on port 6379
```

## 🔧 Environment Variables

Add these to your `.env` file:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Telegram Bot
TELEGRAM_BOT_KEY=your_bot_token_here

# AI Service
MODELSLAB_KEY=your_modelslab_api_key_here
```

## 🎯 Running the System

### Terminal 1: Start Next.js App
```bash
npm run dev
```

### Terminal 2: Start Queue Worker
```bash
npm run queue:worker
```

## 📊 Monitor Queue Status

### Check Queue Status
```bash
# Install Redis CLI tools
brew install redis

# Connect to Redis
redis-cli

# Check queue info
LLEN bull:ai-response:wait
LLEN bull:ai-response:active
LLEN bull:ai-response:completed
LLEN bull:ai-response:failed
```

## 🧹 Cleanup

### Stop Redis Container
```bash
docker stop redis-emanuelle
docker rm redis-emanuelle
```

### Stop All Containers
```bash
docker stop $(docker ps -q)
```

## 🔍 Troubleshooting

### Redis Connection Issues
- Make sure Docker is running
- Check if port 6379 is available
- Verify Redis container is running: `docker ps`

### Queue Worker Issues
- Check Redis connection
- Verify environment variables
- Check console logs for errors

### Performance Issues
- Adjust concurrency in `ai-response-queue.ts`
- Monitor Redis memory usage
- Check job processing times
