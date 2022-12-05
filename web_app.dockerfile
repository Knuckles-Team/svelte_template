FROM node:latest AS node
WORKDIR /app
RUN npm install -g npm@9.1.3
RUN npm install -g vite @sveltejs/vite-plugin-svelte

FROM node AS node_template
WORKDIR /app
RUN npm install vite @sveltejs/vite-plugin-svelte
ARG APPLICATION="test"
ARG HOST=0.0.0.0
ARG PORT=5173
ENV APPLICATION=$APPLICATION
ENV HOST=$HOST
ENV PORT=$PORT
COPY . .
RUN npm install
RUN npm run build
EXPOSE $PORT
CMD [ "npm", "run", "dev" ]
