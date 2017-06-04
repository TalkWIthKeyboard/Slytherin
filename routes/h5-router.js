/**
 * Created by CoderSong on 17/6/4.
 */
const router = require('koa-router')();

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
});

module.exports = router;