const router = require('koa-router')();
var redis = require('../redis/redis');

router.get('/showAll', async (ctx, next) => {
    let name = await redis.getJSON('name');
    console.log('get name => ' + name);
    await ctx.render('logout');
});

router.get('/setName/:name', async (ctx, next) => {
    // let name = ctx.params.name || '';
    let name = [1, 'abc', {'name': 'biu'}];
    await redis.setJSON('name', name);
    console.log('set name => ' + name);
    await ctx.render('logout');
});

module.exports = router;
