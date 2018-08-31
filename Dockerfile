FROM node

#ENV http_proxy http://10.0.0.206:8080
#ENV https_proxy http://10.0.0.206:8080

WORKDIR /

COPY package.json .

RUN npm install -d

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]