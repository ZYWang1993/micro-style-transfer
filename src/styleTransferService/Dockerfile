FROM python:3.7-alpine

# get and install packages
WORKDIR /styleTransferService
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

# add files into working directory
COPY . .

ENV PORT "8080"
ENV WORKERS 2

EXPOSE 8080

CMD gunicorn -w 2 -b 0.0.0.0:8080 style_transfer_server:app
