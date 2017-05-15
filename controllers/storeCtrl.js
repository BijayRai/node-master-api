require('../config/config')
const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const utils = require('../utils/storeUtils')
const slug = require('slugs') //wordpress permalink?
const multer = require('multer')
const jimp = require('jimp')
const sharp = require('sharp')
const uuid = require('uuid') //give all images unique ids
const AWS = require('aws-sdk')
const S3_BUCKET = process.env.S3_BUCKET
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const REGION = process.env.REGION
const s3 = new AWS.S3()
// AWS.config.loadFromPath('./config/config.json');

// define where to store and what types are allowed
const multerOptions = {
  storage: multer.memoryStorage(), //save into mem so we can resize and then save to disk
  fileFilter(req, file, next) {
    console.log('muler')
    console.log(file)

    const isPhoto = file.mimetype.startsWith('image/')
    if (isPhoto) {
      console.log(isPhoto)
      console.log(file)

      // next(error, worked)
      next(null, true)
    } else {
      next({ message: 'that file type isnt allowed' }, false)
    }
  }
}

// middleware fo uploading images
// upload stores our image in mem temporarily for a single photo and then moves to next middleware to resize
// upload also checks file type for security
exports.upload = multer(multerOptions).single('photo')
exports.resize = async (req, res, next) => {
  // console.log('resize')
  // check if there is no new file to resize when we save
  // multer automatically knows if a file was uploaded
  // multer puts the file property on the request
  console.log('resize')
  console.log(req.file)

  if (!req.file) {
    next() // no file so skip to the next middleware
    return
  }

  try {
    const extension = req.file.mimetype.split('/')[1]
    const fileName = `${uuid.v4()}.${extension}`
    // TODO: Set user/filename.jpg
    const bucketName = 'nodeintromaster/' + 'user1Bucket'

    req.body.photo = `https://s3.amazonaws.com/${bucketName}/${fileName}`

    const photo = await sharp(req.file.buffer).resize(800).toBuffer()

    // AWS - POTENTIAL MIDDLEWARE?
    const s3Bucket = new AWS.S3({ params: { Bucket: 'nodeintromaster' } })

    const data = { Key: fileName, Body: photo }

    AWS.config.update({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: REGION
    })

    var params = {
      Bucket: bucketName,
      Key: data.Key,
      Body: data.Body,
      ContentType: 'image/' + extension,
      ACL: 'public-read'
    }

    s3.putObject(params, function(err, res) {
      if (err) {
        console.log('Error uploading data: ', err)
      } else {
        console.log('Successfully uploaded data to myBucket/myKey', res)
        next()
      }
    })
  } catch (e) {
    console.log('error try catch')
    console.log(e)

    next()
    return
  }
}

exports.createStore = async (req, res) => {
  //ERROR TEST OBJECT
  // const error = storeObj
  // error.name = ''
  // const store = new Store(error)

  const store = new Store(req.body)

  try {
    const response = await store.save()
    return res.send(response)
  } catch (e) {
    return res.status(422).send({ message: e.message })
  }
}

exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find()
    return res.send({ stores })
  } catch (e) {
    return res.status(422).send({ message: e.message })
  }
}

exports.updateStore = async (req, res) => {
  // const storeObj = utils.convertTagsToArray(req.body)
  // storeObj.slug = slug(storeObj.name)
  console.log('updateStore')
  console.log(req.body.photo)

  //if its an object - it measn user did not update photo
  // if (typeof req.body.photo === Object) {
  //   delete req.body.photo
  // }

  try {
    //query, data, options
    const store = await Store.findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      {
        new: true, // returns new store and update
        runValidators: true // make sure all properties that need to be there are validated
      }
    ).exec() //execute query and returns a promise
    return res.send({ store })
  } catch (e) {
    return res.status(422).send({ message: e.message })
  }
}
