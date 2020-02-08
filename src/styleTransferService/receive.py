import pika
import time
import os
from run import run
import docs/config


credentials = pika.PlainCredentials(config.pikaUser, config.pikaPassword)
parameters = pika.ConnectionParameters(config.pikaIp,
                                       5672,
                                       '/',
                                       credentials)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()


channel.queue_declare(queue='task_queue', durable=False)
print(' [*] Waiting for messages. To exit press CTRL+C')


def callback(ch, method, properties, body):
    start = time.time()
    print(" [x] Received %r" % body)
    s = body.decode("utf-8") .split(' ')
    s1 = s[0]
    s2 = s[1]
    run(s1,s2)
    print(" [x] Done")
    end = time.time()
    print("total time of receiving a task: ", end-start)
    ch.basic_ack(delivery_tag=method.delivery_tag)



channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='task_queue', on_message_callback=callback)

channel.start_consuming()