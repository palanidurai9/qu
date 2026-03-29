FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build for production
RUN npm run build

# We will serve it with a lightweight dev server for this architecture, 
# but in real prod we would use NGINX. For Vite, we use custom host/port:
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
