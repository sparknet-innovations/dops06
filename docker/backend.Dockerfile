FROM node:18-alpine

WORKDIR /app

# Copy ONLY backend package.json
COPY app/electromart-backend/package*.json ./

RUN npm installl

# Copy backend source code
COPY app/electromart-backend/ .

EXPOSE 3000
CMD ["npm", "starts"]
