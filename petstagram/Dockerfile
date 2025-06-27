# 1단계: Build React app using Vite
FROM node:18-alpine AS build

WORKDIR /app

# 의존성 먼저 복사하여 캐시 활용
COPY package*.json ./
COPY .env ./
RUN npm install

# 전체 소스 복사 후 빌드
COPY . .
RUN npm run build

# 2단계: Serve with Nginx
FROM nginx:alpine

# Nginx 설정 복사 (SPA 라우팅 대응)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
