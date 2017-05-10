const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  // res.send('Hey! It works!');
  res.send({
    text:'Hey! It works!'
  });
});

module.exports = router;
