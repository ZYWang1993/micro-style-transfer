var AWS = require('aws-sdk');
var https = require('https');

AWS.config.loadFromPath('./aws_config.json')

var s3 = new AWS.S3({apiVersion: '2006-03-01'});


// var agent = new https.Agent({
//    maxSockets: 25
// });
//
// AWS.config.update({
//    httpOptions:{
//       agent: agent
//    }
// });
// console.log("Region: ", AWS.config.httpOptions);
