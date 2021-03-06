/**
 * Created by CoderSong on 17/6/4.
 */
const router = require('koa-router')();
const api = require('./api-router');
const h5 = require('./h5-router');

router.use('/api', api.routes(), api.allowedMethods());
router.use('/h5', h5.routes(), h5.allowedMethods());

module.exports = router;
