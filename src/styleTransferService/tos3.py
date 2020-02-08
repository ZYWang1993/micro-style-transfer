import logging
import boto3
from botocore.exceptions import ClientError
import csv

def upload_file(file_name, bucket, object_name=None):
    """Upload a file to an S3 bucket

    :param file_name: File to upload
    :param bucket: Bucket to upload to
    :param object_name: S3 object name. If not specified then file_name is used
    :return: True if file was uploaded, else False
    """

    # If S3 object_name was not specified, use file_name
    if object_name is None:
        object_name = file_name

    # Upload the file

    f = open('docs/accessKeys.csv', 'r')
    reader = csv.reader(f,delimiter=',')
    i = 1
    keys = []
    for row in reader:
        if i == 2:
            keys = row
        i = i + 1
    f.close()
    s3_client = boto3.client('s3',
                             aws_access_key_id=keys[0],
                             aws_secret_access_key=keys[1])
    try:
        response = s3_client.upload_file(file_name, bucket, object_name)
    except ClientError as e:
        logging.error(e)
        return False
    return response

