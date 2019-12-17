const express = require('express');
const router = express.Router();

router.get('/:imageId', function (req, res) {
  res.send('hello, ' + req.params.imageId);
})

module.exports = router;
