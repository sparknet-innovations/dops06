FROM node:18-alpine AS build

WORKDIR /usr/src/app

# Copy ONLY frontend package.json
COPY app/electromart-frontend/package*.json ./

RUN npm install

# Copy frontend source code
COPY app/electromart-frontend/ .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# ---- NGINX STAGE ----
FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
