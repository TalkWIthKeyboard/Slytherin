/**
 * Created by CoderSong on 17/6/5.
 */
let pub = {};

/**
 * 成功返回
 * @param ctx
 * @param data
 * @returns {*}
 */
pub.resSuccessBuilder = (ctx, data) => {
  ctx.status = 200;
  ctx.body = {'data': data};
};

/**
 * 失败返回
 * @param ctx
 * @param err
 * @returns {*}
 */
pub.resErrorBuilder = (ctx, err) => {
  ctx.status = err.status || 510;
  ctx.body = {'err': err.message};
};

module.exports = pub;
