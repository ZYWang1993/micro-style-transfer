# Copyright 2019 The Magenta Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Generates stylized images with different strengths of a stylization.

For each pair of the content and style images this script computes stylized
images with different strengths of stylization (interpolates between the
identity transform parameters and the style parameters for the style image) and
saves them to the given output_dir.
See run_interpolation_with_identity.sh for example usage.
"""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import ast
import os

import arbitrary_image_stylization_build_model as build_model
import image_utils
import numpy as np
import tensorflow as tf
from tensorflow.contrib import slim as contrib_slim
from tos3 import upload_file
from convert_to_jpg import convertimage
import csv
import sys
slim = contrib_slim
import boto3
import time

import grpc

import uid_management_pb2_grpc
import uid_management_pb2
import sys
import docs/config



sys.stdout=open("output.txt","w")

def run(content_images_paths,style_images_paths,style_square_crop=False,style_image_size=400,content_square_crop=False,
image_size=400,checkpoint='arbitrary_style_transfer/model.ckpt',maximum_styles_to_evaluate=1024,
interpolation_weights='[1.0]'):
  f = open('docs/accessKeys.csv', 'r')
  reader = csv.reader(f,delimiter=',')
  i = 1
  keys = []
  for row in reader:
      if i == 2:
          keys = row
      i = i + 1
  f.close()
  s3 = boto3.client('s3',
                          aws_access_key_id=keys[0],
                          aws_secret_access_key=keys[1])
  start = time.time()
  front = content_images_paths.split('.')[0]
  # bucket name, dir of file in s3 bucket, local name
  s3.download_file(config.bucketname, 'target1/'+content_images_paths, content_images_paths)
  convertimage(content_images_paths, False)
  content = 'c_'+front+'.jpg'

  s3.download_file(config.bucketname, 'style1/'+style_images_paths, style_images_paths)
  convertimage(style_images_paths, True)


  style = 's_'+front+'.jpg'
  # start evaluate
  tf.logging.set_verbosity(tf.logging.INFO)
  # if not tf.gfile.Exists(output_dir):
  #   tf.gfile.MkDir(output_dir)

  with tf.Graph().as_default(), tf.Session() as sess:
    # Defines place holder for the style image.
    style_img_ph = tf.placeholder(tf.float32, shape=[None, None, 3])
    if style_square_crop:
      style_img_preprocessed = image_utils.center_crop_resize_image(
          style_img_ph, style_image_size)
    else:
      style_img_preprocessed = image_utils.resize_image(style_img_ph,
                                                        style_image_size)

    # Defines place holder for the content image.
    content_img_ph = tf.placeholder(tf.float32, shape=[None, None, 3])
    if content_square_crop:
      content_img_preprocessed = image_utils.center_crop_resize_image(
          content_img_ph, image_size)
    else:
      content_img_preprocessed = image_utils.resize_image(
          content_img_ph, image_size)

    # Defines the model.
    stylized_images, _, _, bottleneck_feat = build_model.build_model(
        content_img_preprocessed,
        style_img_preprocessed,
        trainable=False,
        is_training=False,
        inception_end_point='Mixed_6e',
        style_prediction_bottleneck=100,
        adds_losses=False)

    if tf.gfile.IsDirectory(checkpoint):
      checkpoint = tf.train.latest_checkpoint(checkpoint)
    else:
      checkpoint = checkpoint
      tf.logging.info('loading latest checkpoint file: {}'.format(checkpoint))

    init_fn = slim.assign_from_checkpoint_fn(checkpoint,
                                             slim.get_variables_to_restore())
    sess.run([tf.local_variables_initializer()])
    init_fn(sess)

    # Gets the list of the input style images.
    style_img_list = tf.gfile.Glob(style)
    if len(style_img_list) > maximum_styles_to_evaluate:
      np.random.seed(1234)
      style_img_list = np.random.permutation(style_img_list)
      style_img_list = style_img_list[:maximum_styles_to_evaluate]

    # Gets list of input content images.
    content_img_list = tf.gfile.Glob(content)

    for content_i, content_img_path in enumerate(content_img_list):
      content_img_np = image_utils.load_np_image_uint8(content_img_path)[:, :, :
                                                                         3]
      content_img_name = os.path.basename(content_img_path)[:-4]

      # Saves preprocessed content image.
      inp_img_croped_resized_np = sess.run(
          content_img_preprocessed, feed_dict={
              content_img_ph: content_img_np
          })
      # image_utils.save_np_image(inp_img_croped_resized_np,
      #                           os.path.join(output_dir,
      #                                        '%s.jpg' % (content_img_name)))

      # Computes bottleneck features of the style prediction network for the
      # identity transform.
      identity_params = sess.run(
          bottleneck_feat, feed_dict={style_img_ph: content_img_np})

      for style_i, style_img_path in enumerate(style_img_list):
        if style_i > maximum_styles_to_evaluate:
          break
        style_img_name = os.path.basename(style_img_path)[:-4]
        style_image_np = image_utils.load_np_image_uint8(style_img_path)[:, :, :
                                                                         3]

        if style_i % 10 == 0:
          tf.logging.info('Stylizing (%d) %s with (%d) %s' %
                          (content_i, content_img_name, style_i,
                           style_img_name))

        # Saves preprocessed style image.
        style_img_croped_resized_np = sess.run(
            style_img_preprocessed, feed_dict={
                style_img_ph: style_image_np
            })
        # image_utils.save_np_image(style_img_croped_resized_np,
        #                           os.path.join(output_dir,
        #                                        '%s.jpg' % (style_img_name)))

        # Computes bottleneck features of the style prediction network for the
        # given style image.
        style_params = sess.run(
            bottleneck_feat, feed_dict={style_img_ph: style_image_np})

        interpolation_weights = ast.literal_eval(interpolation_weights)
        # Interpolates between the parameters of the identity transform and
        # style parameters of the given style image.
        for interp_i, wi in enumerate(interpolation_weights):
          stylized_image_res = sess.run(
              stylized_images,
              feed_dict={
                  bottleneck_feat:
                      identity_params * (1 - wi) + style_params * wi,
                  content_img_ph:
                      content_img_np
              })

          # Saves stylized image.
          image_utils.save_np_image(
              stylized_image_res,
              front+'.jpg')
  upload_file(front+'.jpg','styletransferimage','output1/'+front+'.jpg')
  print("finished upload")
  os.remove('c_'+front+'.jpg')
  os.remove('s_'+front+'.jpg')
  os.remove(front+'.jpg')
  status = False
  retryCounter = 2
  while retryCounter > 0:
      try:
          channel = grpc.insecure_channel('54.164.44.43:50051')
          stub = uid_management_pb2_grpc.UidManagementStub(channel)
          status = stub.TransferCompleted(uid_management_pb2.Id(id=front))
          retryCounter = 0
      except:
          retryCounter -= 1

# run('beijing.jpg','starrynight.jpg')
