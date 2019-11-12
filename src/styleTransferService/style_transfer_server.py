#!/usr/bin/python

import logging.config
import logging
import yaml

from flask import Flask, abort, jsonify, request, Response

# init logger
with open('./config/config.yml', 'r') as config:
    configs = yaml.safe_load(config)

logging.config.dictConfig(configs)
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/images/<string:image_id>', methods=['GET'])
def retrieveImage(image_id):
    res = {"status" : "success. In production, repalce return statment with \
    something like send_file(filename, mimetype='image/gif')"}
    return jsonify(res)

@app.route('/images/transfer', methods=['POST'])
def transferImage():
    res = {"staus" : "success. In production, this should grab images \
    from request and do the style transfer"}
    return jsonify(res)

if __name__ == "__main__":
    app.run()
