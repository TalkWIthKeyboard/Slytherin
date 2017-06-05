const router = require('koa-router')();
var redis   = require('redis');
var client  = redis.createClient('6379', '127.0.0.1');

function logBefore(msg = '') {
    console.log("=========> Start " + msg + "... <=========");
}

function logAfter(msg = '') {
    console.log("=========>   End " + msg + "... <=========");
}

var set = async function(key, value) {
    logBefore('Set');
    await new Promise((resolve, reject) => {
        client.set(key, value, function (err, reply) {
            console.log(reply);
            resolve();
        });
    });
    logAfter('Set');
};

var get = async function(key) {
    logBefore('Get');
    var ret = "";
    await new Promise((resolve, reject) => {
        client.get(key, function (err, reply) {
            console.log(reply);
            ret = reply;
            resolve();
        });
    });
    logAfter('Get');
    return ret;
};

var setJSON = async function(key, value) {
    logBefore('Set');
    await new Promise((resolve, reject) => {
        client.set(key, JSON.stringify(value), function (err, reply) {
            console.log(reply);
            resolve();
        });
    });
    logAfter('Set');
};

var getJSON = async function(key) {
    logBefore('Get');
    var ret = "";
    await new Promise((resolve, reject) => {
        client.get(key, function (err, reply) {
            console.log(reply);
            ret = reply;
            resolve();
        });
    });
    logAfter('Get');
    return JSON.parse(ret);
};

module.exports = {
    set: set,
    get: get,
    setJSON: setJSON,
    getJSON: getJSON
};
