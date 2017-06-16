/**
 * Created by CoderSong on 17/6/4.
 */
const router = require('koa-router')();

router.get('/Hall', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hall'
  })
});

router.get('/Room', async (ctx, next) => {
  await ctx.render('room', {
    title: 'Room'
  })
});

module.exports = router;