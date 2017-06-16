/**
 * Created by CoderSong on 17/6/5.
 */

const _ = require('underscore');
const response = require('./responseServer');
const error = require('./../code/responseCode');
let pub = {};

/**
 * 检查登录中间件
 * @returns {function(*, *)}
 */
pub.checkLogin = () => {
  let whiteList = [{
    url: '/api/user',
    type: 'POST'
  },{
    url: '/api/login',
    type: 'POST'
  },{
    url: '/h5/Hall',
    type: 'GET'
  },{
    url: '/h5/Room',
    type: 'GET'
  }];

  return async (ctx, next) => {
    let flag = false;
    _.each(whiteList, (obj) => {
      flag = obj.url === ctx.request.url && obj.type === ctx.request.method ? true : flag;
    });
    if (_.keys(ctx.session).length !== 0 || flag) await next();
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