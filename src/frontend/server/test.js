function getuid(ip) {
  return new Promise((reslove, reject) => {
    stub.getUid(ip, (err, data) => {
      if (err) {
        reject();
      } else {
        resovle(data);
      }
    });
  });
}

function amqpConnect(hostname) {
  return new Promise((reslove, reject) => {
    amqp.connect('amqp://localhost', function(error0, connection) {
      if (error0) {
        reject();
      } else {
        reslove(connection);
      }
    });
  });
}

function amqpCreateChannel(connection, id) {
  return new Promise((reslove, reject) => {
    connection.createChannel(function(error1, channel) {
      if (error1) {
        reject();
      } else {
        var queue = 'hello';
        var msg = 'Hello world';

        channel.assertQueue(queue, {
          durable: false
        });

        channel.sendToQueue(queue, Buffer.from(msg));
        console.log(" [x] Sent %s", msg);
        reslove();
      }
    });
  });
}

var id = ''
getuid(ip)
.then((data) => {
  id = data
  return Promise.all([p1(), p2()]);
})
.then((args) => {
  return amqpConnect(hostname);
})
.then((connection) => {
  return amqpCreateChannel(connection, id);
})
.then(() => {

})

function i_am_last_but_i_take_1_sec() {
    return new Promise((resolve, reject)=>{
      for (let i = 0; i < 100000000; i++) {
        var c = i * 2+ i -1;
      }
      resolve(c);
    })
}

function i_am_fourth_but_i_take_4_sec() {
    return new Promise((resolve, reject)=>{
      for (let i = 0; i < 100000000; i++) {
        var c = i * 2+ i -1;
      }
      reject('error' + c);
    })
}

function i_am_third_but_i_take_6_sec() {
    return new Promise(function (resolve, reject) {
      for (let i = 0; i < 100000000; i++) {
        var c = i * 2+ i -1;
      }
      resolve(c);
    })
}

function i_am_second_but_i_take_8_sec() {
    return new Promise((resolve, reject)=>{
      for (let i = 0; i < 100000000; i++) {
        var c = i * 2+ i -1;
      }
      resolve(c);
    })
    return
}

function i_am_first_but_i_take_10_sec() {
    return new Promise((resolve, reject)=>{
      for (let i = 0; i < 100000000; i++) {
        var c = i * 2+ i -1;
      }
      resolve(c)
    })
}

// function run (){
//     i_am_first_but_i_take_10_sec()
//     .then((data) => {
//         console.log(data);
//         return i_am_second_but_i_take_8_sec()
//     })
//     .then((data) => {
//       console.log(data);
//         return i_am_third_but_i_take_6_sec()
//     })
//     .then((data) => {
//       console.log(data);
//         return i_am_fourth_but_i_take_4_sec()
//     })
//     .then((data) => {
//       console.log(data);
//         return i_am_last_but_i_take_1_sec()
//     })
//     .then((data) => {
//       console.log(data);
//     })
//     .catch((err) => {
//       console.log('error' + err);
//     });
// }

async function run (){
  try {
    data1 = await i_am_first_but_i_take_10_sec()
    console.log(data1)
    data2 = await i_am_second_but_i_take_8_sec()
    console.log(data2)
    data3 = await i_am_third_but_i_take_6_sec()
    console.log(data3)
    data4 = await i_am_fourth_but_i_take_4_sec()
    console.log(data4)
    data5 = await i_am_last_but_i_take_1_sec()
    console.log(data5)
  } catch(error) {
    console.log(error)
  }
}

run()
