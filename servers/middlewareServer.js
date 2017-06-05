/**
 * Created by CoderSong on 17/6/5.
 */

let pub = {};

/**
 * 检查登录中间件
 * @returns {function(*, *)}
 */
pub.checkLogin = () => {
  return async (ctx, next) => {
    // TODO 未登录错误
    !!ctx.session ? await next() : await next('error!');
  }
};


module.exports = pub;