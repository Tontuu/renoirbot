# Use the official Node.js 14 image as the base
ARG NODE_VERSION=20.16.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

# Copy the rest of the application code to the container
COPY . .

# Install the dependencies
RUN npm install

# Expose the app's port (if it has a web interface or API)
EXPOSE 8080

# Start the bot (or adjust to your main file)
CMD ["node", "client.js"]