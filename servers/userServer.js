/**
 * Created by CoderSong on 17/6/5.
 */

const jwt = require('jsonwebtoken');
const _ = require('underscore');
const check = require('./checkServer');
const crypto = require('crypto');
const user = require('./../model/user');
const token = require('./../model/token');
const error = require('./../code/responseCode');
const response = require('./responseServer');
let pub = {};

/**
 * token生成器
 * @param user
 * @returns {Promise.<void>}
 */
let makeToken = async (user) => {
  let content = {
    'account': user.account,
    'password': user.password,
    'date': Date.now().toString()
  };
  let secretOrPrivateKey = 'I don`t want talk with you!';
  try {
    let _token = await jwt.sign(content, secretOrPrivateKey);
    let userToken = await token.checkIsExist('user', user._id);
    // 如果已经有token则用新的token覆盖，没有就新建
    if (!!userToken) {
      userToken.token = _token;
    } else {
      userToken = new token({
        token: _token,
        user: user._id
      })
    }
    await userToken.save();
    return _token;
  } catch (err) {
    throw error.builder(err);
  }
};

/**
 * 创建用户
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
pub.createUser = async (ctx, next) => {
  try {
    console.log(ctx.request.body);
    let body = await check.checkBodyPromise(ctx.request.body, user, null);
    let _account = await user.checkIsExist('account', body.account);
    let _username = await user.checkIsExist('username', body.username);
    if (!!_account || !!_username)
      throw error.builder(error.warning.CREATE_USER_ERROR.message, 410);
    else {
      // 加密
      let shasum = crypto.createHash('md5');
      shasum.update(body.password);
      body.password = shasum.digest('hex');
      await check.saveObj(ctx, body, user);
    }
  } catch (err) {
    throw error.builder(err);
  }
};


/**
 * 登录用户
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
pub.loginUser = async (ctx, next) => {
  try {
    let body = await check.checkBodyPromise(ctx.request.body, null, ['account', 'password']);
    let _user = await user.checkIsExist('account', body.account);

    // 加密
    let shasum = crypto.createHash('md5');
    if (!!_user) {
      shasum.update(_user.password);
      _user.password = shasum.digest('hex');
    }

    if (!!_user && _user.password === body.password) {
      let token = await makeToken(_user);
      if (_.keys(ctx.session).length === 0){
        console.log('hello');
        ctx.session = {
          'account': _user.account,
          'username': _user.username
        };
      }
      await response.resSuccessBuilder(ctx, {'token': token});
    } else
      throw error.builder(error.warning.USER_ERROR.message, 410);
  } catch (err) {
    throw error.builder(err);
  }
};

module.exports = pub;
