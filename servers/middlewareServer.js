/**
 * Created by CoderSong on 17/6/5.
 */

const response = require('./responseServer');
const error = require('./../code/responseCode');
let pub = {};

/**
 * 检查登录中间件
 * @returns {function(*, *)}
 */
pub.checkLogin = () => {
  return async (ctx, next) => {
    if (!!ctx.session) await next();
    else throw error.builder(error.warning.LOGIN_ERROR.message, 410);
  }
};

/**
 * 错误处理中间件
 * @returns {function(*, *=, *)}
 */
pub.errorHandler = () => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      let _err = new Error(err.message);
      _err.status = err.status;
      await response.resErrorBuilder(ctx, _err);
    }
  }
};


module.exports = pub;