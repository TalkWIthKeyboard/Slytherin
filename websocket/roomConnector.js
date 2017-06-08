/**
 * Created by CoderSong on 17/6/4.
 */

const User = require('./user').user;
const RoomUser = require('./user').roomUser;
const Room = require('./room');
// users的结构: Map(roomId: Map(userId: {user},))
let users = new Map();
let pub = {};

/**
 * 房间内广播
 * @param wss
 * @param ws
 * @param roomId 房间id
 * @param otherData 发送给非自己客户端的信息
 * @param myData 发送给自己客户端的信息
 */
let broadcast = (wss, ws, roomId, otherData, myData) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client !== ws
        ? client.send(JSON.stringify(otherData))
        : client.send(JSON.stringify(myData))
    }
  });
};

/**
 * 单播给自己
 * @param wss
 * @param ws
 * @param data
 */
let sendToMe = (wss, ws, data) => {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN)
      if (client === ws) client.send(JSON.stringify(data))
  });
};


/**
 * Map转String
 * @param map
 * @param type 信息状态
 * @returns {string}
 */
let mapToString = (map, type) => {
  let str = '{';
  str += `type: ${type}, users:`;
  for (let item of map.entries()) {
    item[1].id = item[0];
    str += `${JSON.stringify(item[1])},`;
  }
  str.substring(0, str.length - 2);
  return `${str}}`;
};


/**
 * Obj转String
 * @param socketId
 * @param roomId
 */
let MapObjToString = (roomId, socketId) => {
  let obj = users.get(roomId).get(socketId);
  obj.id = socketId;
  return JSON.stringify(obj);
};

/**
 * 获取每个房间的人数
 * @returns string
 * @constructor
 */
let GetRoomNumber = () => {
  let str = '[';
  for (let item of users.entries())
    str += `${JSON.stringify({'roomId': item[0], 'number': item[1].players.length, 'limit': item[1].number})},`;
  str.substring(0, str.length - 2);
  return `${str}]`;
};


/**
 * 房间准备阶段的逻辑
 * @param socketIO
 * @param socket
 */
let workTypeRoom = (socketIO, socket) => {
  let roomId = socket.handshake.query.roomId;
  let socketId = socket.id;

  // 1. 进入房间
  socket.join(roomId);
  // 广播房间内的玩家有人加入
  socketIO.in(roomId).emit('join', MapObjToString(roomId, socketId));

  // 2. 玩家进行准备
  socket.on('ready', () => {
    let _user = users.get(roomId).get(socketId);
    if (!_user.type) _user.changeType();
    // 广播房间内的玩家有人准备
    socketIO.in(roomId).emit('ready', socketId);
  });

  // 3. 玩家取消准备
  socket.on('noReady', () => {
    let _user = users.get(roomId).get(socketId);
    if (_user.type) _user.changeType();
    // 广播房间内的玩家有人取消准备
    socketIO.in(roomId).emit('noReady', socketId);
  });

  // 4. 玩家退出房间
  socket.on('disconnect', () => {
    let room = user.get(roomId);
    if (room) room.exitRoom(socketId);
    // 广播房间内的玩家有人退出房间
    socketIO.in(roomId).emit('disconnect', socketId);
    socket.leave(roomId);
  });

};

/**
 * 大厅房间选择阶段
 * @param socketIO
 * @param socket
 */
let workTypeHall = (socketIO, socket) => {
  let socketId = socket.id;

  // 1. 向改用户发送所有房间人数消息
  socketIO.to(socketId).emit('roomNumber', GetRoomNumber());

  // 2. 玩家加入房间
  socket.on('join', message => {
    let msg = JSON.parse(message);
    let _user = new RoomUser(msg.name, msg.roomId);
    let room = users.get(msg.roomId);
    if (room) room.joinRoom(socketId, _user);
    else users.set(msg.roomId, new Room(socketId, _user));
    // 向大厅所有玩家通知房间人数变化
    socketIO.send('roomNumber', GetRoomNumber());
  })

};


/**
 * socketIO连接函数
 * @type {(p1?:*)}
 */
pub.connect = (socketIO => {
  socketIO.on('connection', socket => {
    let pageType = socket.handshake.query.type;
    switch (pageType) {
      // 0. 大厅阶段
      case 'Hall':
        workTypeHall(socketIO, socket);
        break;
      // 1. 房间准备阶段
      case 'Room':
        workTypeRoom(socketIO, socket);
        break;
      // 2. 游戏开始阶段
      case 'Play':
        break;
    }
  })
});


module.exports = pub;