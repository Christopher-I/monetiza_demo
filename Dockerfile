FROM node:18

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files (this includes the source code)
COPY . .

# Build the frontend app (optional)
RUN npm run build

# Expose port 5173 (frontend dev server)
EXPOSE 5173

# Start the dev server (usually to run React in dev mode)
CMD ["npm", "run", "dev"]
