# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Install build dependencies required for bcrypt
RUN apk add --no-cache python3 make g++ python3-dev

# Set the working directory
WORKDIR /usr/src/app

# [Important] Change ownership of the app directory to the 'node' user
# The 'node' user is included in the base image
RUN chown -R node:node /usr/src/app

# Switch to the non-root 'node' user
USER node

# Copy package.json and package-lock.json
# Do this as the 'node' user to ensure correct permissions
COPY --chown=node:node package*.json ./

# Install app dependencies
RUN npm install --build-from-source

# Bundle app source, ensuring the 'node' user owns the files
COPY --chown=node:node . .

# Your app binds to port 5000, so expose it
EXPOSE 5000

# Define the command to run your app
CMD [ "npm", "start" ]