FROM node:22-slim
WORKDIR /app
COPY . ./
RUN npm install

ENV NODE_ENV=production
CMD ["npm", "run", "start"]

EXPOSE 5000