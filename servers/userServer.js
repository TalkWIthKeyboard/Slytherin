/**
 * Created by CoderSong on 17/6/5.
 */

const check = require('./checkServer');
const user = require('./../model/user');
const error = require('./../code/responseCode');
let pub = {};

/**
 * 创建用户
 * @param ctx
 * @param next
 * @returns {Promise.<void>}
 */
pub.createUser = async (ctx, next) => {
  try {
    let body = await check.checkBodyPromise(ctx.request.body, user, null);
    let _account = await user.checkIsExist('account', body.account);
    let _username = await user.checkIsExist('username', body.username);
    if (!!_account || !!_username)
      throw error.builder(error.warning.CREATE_USER_ERROR.message, 410);
    else
      await check.saveObj(ctx, body, user);
  } catch (err) {
    throw error.builder(err);
  }
};

module.exports = pub;