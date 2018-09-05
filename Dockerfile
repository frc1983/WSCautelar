FROM node

#ENV http_proxy http://10.0.0.206:8080
#ENV https_proxy http://10.0.0.206:8080

RUN npm install nodemon -d  

WORKDIR /

COPY package.json .

RUN npm install -d

COPY . .

EXPOSE 8080
EXPOSE 5858

CMD [ "npm", "start" ]