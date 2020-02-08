FROM ubuntu:16.04
WORKDIR /arbitrary-transfer
COPY . . 
RUN apt-get update
RUN apt-get -y install python3
RUN apt-get -y install python3-pip
RUN apt-get install -y wget
RUN apt-get install -y tar
RUN wget https://storage.googleapis.com/download.magenta.tensorflow.org/models/arbitrary_style_transfer.tar.gz
RUN tar -xvzf arbitrary_style_transfer.tar.gz
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

CMD ["python3", "receive.py"]