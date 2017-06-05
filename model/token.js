/**
 * Created by CoderSong on 17/6/5.
 */

const mongoose = require('mongoose');

let TokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  token: String,
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
});

TokenSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }
  next()
});

TokenSchema.statics = {
  checkIsExist: function (key, value, cb) {
    let obj = {};
    obj[key] = value;
    return this
      .findOne(obj)
      .exec(cb)
  },

  findById: function (id, cb) {
    return this
      .findOne({_id: id})
      .exec(cb)
  },

  findAll: function (cb) {
    return this
      .find({})
      .exec(cb)
  },

  deleteById: function (id, cb) {
    return this
      .remove({_id: id})
      .exec(cb)
  }
};

module.exports = mongoose.model('Token', TokenSchema);