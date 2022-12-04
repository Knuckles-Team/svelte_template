FROM node:latest AS node
WORKDIR /app
RUN npm install -g npm@9.1.3
RUN npm install -g vite

FROM node AS node_template
ARG APPLICATION="test"
ARG HOST=0.0.0.0
ARG PORT=5050
ENV APPLICATION=$APPLICATION
ENV HOST=$HOST
ENV PORT=$PORT
#RUN npm create svelte@latest ${APPLICATION}
COPY package.json package-lock.json ./
RUN npm ci
COPY . /app
RUN npm install
RUN npm run build
RUN npm prune --production
EXPOSE $PORT
CMD [ "node", "build" ]


#FROM ubuntu:latest AS nodejs
#RUN apt update && apt upgrade -y && apt -y install curl wget nano vim dos2unix build-essential gcc git
#RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
#RUN apt update && apt install -y nodejs
#WORKDIR /app
#RUN npm install -g npm@9.1.3
#RUN npm install vite
#
#FROM nodejs AS webapp
#ARG APPLICATION="test"
#ARG HOST=0.0.0.0
#ARG PORT=5173
#ENV APPLICATION=$APPLICATION
#ENV HOST=$HOST
#ENV PORT=$PORT
#RUN npm create svelte@latest ${APPLICATION}
#COPY ./ /app
#RUN npm install
#EXPOSE 5173
#COPY deploy-svelte.sh /usr/bin/deploy-svelte
#RUN chmod +x /usr/bin/deploy-svelte
#ENTRYPOINT ["deploy-svelte", "-e", "dev"]