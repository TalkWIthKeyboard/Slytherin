const router = require('koa-router')();
// let redis   = require('redis');
// let client  = redis.createClient('6379', '127.0.0.1');
//
// let pub = {}
//
// function logBefore(msg = '') {
//     console.log("=========> Start " + msg + "... <=========");
// }
//
// function logAfter(msg = '') {
//     console.log("=========>   End " + msg + "... <=========");
// }
//
// pub.set = async (key, value) => {
//     logBefore('Set');
//     await new Promise((resolve, reject) => {
//         client.set(key, value, function (err, reply) {
//             console.log(reply);
//             resolve();
//         });
//     });
//     logAfter('Set');
// };
//
// pub.get = async (key) => {
//     logBefore('Get');
//     var ret = "";
//     await new Promise((resolve, reject) => {
//         client.get(key, function (err, reply) {
//             console.log(reply);
//             ret = reply;
//             resolve();
//         });
//     });
//     logAfter('Get');
//     return ret;
// };
//
// pub.setJSON = async (key, value) => {
//     logBefore('Set');
//     await new Promise((resolve, reject) => {
//         client.set(key, JSON.stringify(value), function (err, reply) {
//             console.log(reply);
//             resolve();
//         });
//     });
//     logAfter('Set');
// };
//
// pub.getJSON = async (key) => {
//     logBefore('Get');
//     var ret = "";
//     await new Promise((resolve, reject) => {
//         client.get(key, function (err, reply) {
//             console.log(reply);
//             ret = reply;
//             resolve();
//         });
//     });
//     logAfter('Get');
//     return JSON.parse(ret);
// };

// module.exports = pub;
