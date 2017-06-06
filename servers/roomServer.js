const jwt = require('jsonwebtoken');
const check = require('./checkServer');
const user = require('./../model/user');
const token = require('./../model/token');
const error = require('./../code/responseCode');
const response = require('./responseServer');
const redis = require('../redis/redis');
let pub = {};

pub.join = async (ctx, next) => {
    try {
        let body = await check.checkBodyPromise(ctx.request.body, null, ['roomId']);
        let username = ctx.session.username;
        let account = ctx.session.account;
        let user = redis.getJSON(username);
        if (user == null) {
            user = {};
            user.startTime = process.uptime();
            user.account = body.account;
            user.username = body.username;
        }
        user.roomId = body.roomId;
        redis.setJSON(username, user);
        await response.resSuccessBuilder(ctx, {'status': 'ok'});
    } catch (err) {
        throw error.builder(err);
    }
};

module.exports = pub;
