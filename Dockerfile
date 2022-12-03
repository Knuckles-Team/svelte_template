FROM node:latest AS node
WORKDIR /usr/src/app
RUN npx degit sveltejs/template /usr/src/app
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "run" ]
#FROM ubuntu:latest AS ubuntu
#RUN apt update && apt upgrade -y && apt install curl wget nano vim dos2unix build-essential gcc
#RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
#RUN apt update && apt install -y nodejs
#RUN npx degit sveltejs/template ./
#RUN npm install
#COPY deploy-svelte.sh /usr/bin/deploy-svelte
#RUN chmod +x /usr/bin/deploy-svelte
#ENTRYPOINT ["deploy-svelte", "-h"]