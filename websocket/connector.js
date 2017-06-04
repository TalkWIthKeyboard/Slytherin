/**
 * Created by CoderSong on 17/6/4.
 */

let pub = {};

/**
 * websocket连接
 * @type {(p1:*)}
 */
pub.connect = (async (wss) => {
  wss.on('connection', (ws) => {
    console.log('connection');
  })
});


module.exports = pub;