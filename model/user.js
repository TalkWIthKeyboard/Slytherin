/**
 * Created by CoderSong on 17/6/5.
 */

let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  // 用户名
  username: String,
  // 账号
  account: String,
  // 密码
  password: String
});

UserSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }
  next()
});

UserSchema.statics = {
  checkIsExist: function (username, cb) {
    return this
      .findOne({username: username})
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

module.exports = mongoose.model('User', UserSchema);