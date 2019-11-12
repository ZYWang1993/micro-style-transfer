# micro-style-transfer

# Step 1: Building the Docker container:
cd to the /src/styleTransferService folder then run:
> docker build -t YOUR_CONTAINER_NAME:YOUR_TAG .

e.g.
> docker build -t style_transfer:0 .

# Step 2: Running the container:
> docker run -p `HOST_PORT`:<`DOCKER_PORT`> YOUR_CONTAINER_NAME:YOUR_TAG

e.g.
> docker run -p 8080:8080 style_transfer:0

# Step 3: Accessing the APIs from host machine:
>  curl http://127.0.0.1:<`DOCKER_PORT`>/images/string

e.g.
> curl http://127.0.0.1:8080/images/3IjSwOLP

If success, you should get a Json response like
{"status" : "success. In production, repalce return statment with something like send_file(filename, mimetype='image/gif')"}
