const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slugs') //wordpress permalink?

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  photo: String
})

//before its save - we run a function to build the SLUG
storeSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slug(this.name)
  }
  next()
})

module.exports = mongoose.model('Store', storeSchema)