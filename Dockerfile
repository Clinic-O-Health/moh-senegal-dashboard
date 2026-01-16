# -------- BUILD STAGE --------
FROM node:20-alpine AS build

WORKDIR /usr/local/app

COPY . .
RUN rm package-lock.json
RUN npm install
RUN npm run build

# -------- RUN STAGE --------
FROM nginx:alpine

# Supprime la conf par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Angular build output
COPY --from=build /usr/local/app/dist/moh-dashboard-sn/browser /usr/share/nginx/html

# Nginx frontend config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
