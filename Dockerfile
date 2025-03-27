# Use official node image as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the app files
COPY . ./

# Expose port and start the app
EXPOSE 3000
CMD ["npm", "start"]

