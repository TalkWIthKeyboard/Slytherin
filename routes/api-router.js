/**
 * Created by CoderSong on 17/6/4.
 */
const router = require('koa-router')();
const user = require('./../servers/userServer');

/**
 * 用户注册
 */
router.post('/user', async (ctx, next) => {
  await user.createUser(ctx, next);
});

module.exports = router;