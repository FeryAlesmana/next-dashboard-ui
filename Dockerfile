FROM node:22.18.0

WORKDIR /app

# Copy package files
COPY package*.json ./

# @ Copy Prisma schema BEFORE npm installl
COPY prisma ./prisma

# Install dependencies (prisma generate works now)
RUN npm install

# Copy rest of the app
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

# Start app
CMD ["npm", "start"]