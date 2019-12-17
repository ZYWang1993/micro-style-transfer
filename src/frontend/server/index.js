const express = require('express')
const app = express()
const imageRouter = require('./routes/image')
const styleTransferRouter = require('./routes/styleTransfer')
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use('/image', imageRouter)
app.use('/transfer', styleTransferRouter)

app.listen(8888)
