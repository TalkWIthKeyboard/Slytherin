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

/**
 * 用户登录
 */
router.post('/login', async (ctx, next) => {
  await user.loginUser(ctx, next);
});

module.exports = router;