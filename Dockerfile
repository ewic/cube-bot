# Use Node.js LTS version
FROM --platform=linux/amd64 node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy compiled code
COPY dist ./dist

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (optional, not needed for Discord bot)
# EXPOSE 3000

# Start the bot
CMD ["node", "dist/bot.js"]
