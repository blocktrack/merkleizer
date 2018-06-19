FROM library/node

# Set the work directory
RUN mkdir -p /var/www/app
WORKDIR /var/www/app

# Add package.json and install dependencies
COPY ./package.json ./
RUN npm install --production

# Add application files
COPY src /var/www/app

EXPOSE 80

CMD ["sh", "-c", "npm start"]
