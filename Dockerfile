FROM nikolaik/python-nodejs:latest

WORKDIR /app

# Copy the rest of the application code to the container
COPY . .

RUN pip install -r requirements.txt

# Install the dependencies
RUN npm install

# Expose the app's port (if it has a web interface or API)
EXPOSE 8080
EXPOSE 8000

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Start the bot (or adjust to your main file)
CMD ["bash", "/app/start.sh"]