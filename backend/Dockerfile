FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies (using npm install for development)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose backend port
EXPOSE 5000

# Run development server with hot-reloading
CMD ["npm", "run", "dev"]
