const express = require('express')
const router = express.Router()
const storeCtrl = require('../controllers/storeCtrl.js')

// Do work here
router.get('/', (req, res) => {
  res.send('no access')
  // res.send({
  //   text:'Hey! It works!'
  // });
  // res.render('layout')
})

// chain functions for uploading images -> data
router.post('/add', storeCtrl.upload, storeCtrl.resize, storeCtrl.createStore)
router.get('/store/:slug', storeCtrl.getStore)
router.get('/stores', storeCtrl.getStores)
router.get('/tags/:tag*?', storeCtrl.getTagsList)
router.post(
  '/update',
  storeCtrl.upload,
  storeCtrl.resize,
  storeCtrl.updateStore
)

module.exports = router
