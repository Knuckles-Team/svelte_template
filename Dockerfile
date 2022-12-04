#FROM node:latest AS node
#WORKDIR /usr/src/app
#RUN npm install -g npm@9.1.3
#RUN npm install -g degit
#RUN npx degit sveltejs/template /usr/src/app
#RUN npm install
#
#FROM node AS node_template
#COPY . .
#EXPOSE 3000
#CMD [ "node", "start" ]


FROM ubuntu:latest AS nodejs
RUN apt update && apt upgrade -y && apt -y install curl wget nano vim dos2unix build-essential gcc git
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt update && apt install -y nodejs
RUN npm install -g npm@9.1.3
WORKDIR /usr/src/app

FROM nodejs AS webapp
ARG APPLICATION="test"
ENV APPLICATION="test"
RUN npm create svelte@latest ${APPLICATION}
COPY ./svelte_template /usr/src/app
EXPOSE 3000
COPY deploy-svelte.sh /usr/bin/deploy-svelte
RUN chmod +x /usr/bin/deploy-svelte
ENTRYPOINT ["deploy-svelte", "-e", "dev"]