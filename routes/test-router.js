const router = require('koa-router')();
// var redis = require('../redis/redis');

// router.get('/showAll', async (ctx, next) => {
//     let name = await redis.getJSON('username');
//     console.log('get name => ' + name);
//     await ctx.render('logout');
// });

router.post('/index', async (ctx, next) => {
    let data = ctx.request.body;
});

module.exports = router;
