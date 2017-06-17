/**
 * Created by CoderSong on 17/6/4.
 */

const RoomUser = require('./user').roomUser;
const Room = require('./room');
const Center = require('./centerController');
// users的结构: Map(roomId: Map(userId: {user},));
let users = new Map();
// players的结构: Map(roomId: CenterController);
let players = new Map();
let pub = {};
let roomNumber = 0;

/**
 * Map转String
 * @param map
 * @returns {string}
 */
let mapToString = (map) => {
  let str = '[';
  for (let item of map.entries()) {
    item[1].id = item[0];
    str += `${JSON.stringify(item[1])},`;
  }
  str = str.substring(0, - 2);
  return `${str}]`;
};

/**
 * 对RoomId进行自增
 */
let getRoomId = () => {
  roomNumber ++;
  return roomNumber;
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
let GetRoomNumber = (map) => {
  let list = [];
  for (let item of map.entries()) {
    let obj = {};
    obj.roomId = item[0];
    obj.number = item[1].players.size;
    obj.limit = item[1].number;
    obj.name = item[1].name;
    list.push(obj);
  }
  return list;
};

/**
 * 房间准备阶段的逻辑
 * @param socketIO
 * @param socket
 */
let workTypeRoom = (socketIO, socket) => {
  let roomId = socket.handshake.query.roomId;
  let socketId = socket.id;
  // 大厅页面的socketId
  let roomSocketId = socket.handshake.query.socketId;

  // 单播该用户房间内的信息
  socket.emit('enter', JSON.stringify({'users':mapToString(users.get(roomId).players)}));
  // 广播房间内的玩家有人加入
  socketIO.in(roomId).emit('join', JSON.stringify({'user':MapObjToString(roomId, roomSocketId)}));
  // 1. 进入房间
  socket.join(roomId);

  // 2. 玩家进行准备
  socket.on('ready', () => {
    let _room = users.get(roomId);
    let _user = _room.get(roomSocketId);
    if (! _user.type) _user.changeType();
    if (_room.checkStart())
      // 游戏开始
      socketIO.in(roomId).emit('start');
    else
      // 广播房间内的玩家有人准备
      socketIO.in(roomId).emit('ready', roomSocketId);
  });

  // 3. 玩家取消准备
  socket.on('noReady', () => {
    let _user = users.get(roomId).get(roomSocketId);
    if (_user.type) _user.changeType();
    // 广播房间内的玩家有人取消准备
    socketIO.in(roomId).emit('noReady', roomSocketId);
  });

  // 4. 玩家退出房间
  socket.on('exit', () => {
    let room = users.get(roomId);
    if (room) room.exitRoom(roomSocketId);
    // 广播房间内的玩家有人退出房间
    socketIO.in(roomId).emit('disconnect', roomSocketId);
    socket.leave(roomId);
    // 关闭房间
    if (room.players.size === 0) users.delete(roomId);
  });

  // 5. 游戏开始的退出
  socket.on('disconnect', () => {

  });
};

/**
 * 大厅房间选择阶段
 * @param socketIO
 * @param socket
 */
let workTypeHall = async (socketIO, socket) => {
  let socketId = socket.id;

  // 0. 向该用户发送自己的socketId
  // 1. 向该用户发送所有房间人数消息
  socket.emit('socketId', socketId);
  socket.emit('roomNumber', JSON.stringify({'room': GetRoomNumber(users)}));

  // 2. 玩家加入房间
  socket.on('join', message => {
    let msg = JSON.parse(message);

    let _user = new RoomUser(msg.name, msg.roomId);
    let room = users.get(msg.roomId);
    room.joinRoom(socketId, _user);
    // 向大厅所有玩家通知房间人数变化
    socket.broadcast.emit('roomNumber', JSON.stringify({'room': GetRoomNumber(users)}));
    socket.emit('join', msg.roomId);
  });

  // 3. 玩家创建房间
  socket.on('create', message => {
    let msg = JSON.parse(message);

    if (!! msg.user && !! msg.room) {
      let roomId = getRoomId();
      let _user = new RoomUser(msg.user.name, roomId);
      users.set(roomId, new Room(socketId, _user, msg.room.name, msg.room.number));
      socket.broadcast.emit('roomNumber', JSON.stringify({'room': GetRoomNumber(users)}));
      socket.emit('create', roomId);
    } else
      socket.emit('error');

  });

  // 4. 玩家进入大厅
  socket.on('enter', message => {
    let msg = JSON.parse(message);

    // 玩家是从其他房间退出来的
    if (msg.roomId !== '')
    // 向大厅所有玩家通知房间人数变化
      socket.broadcast.emit('roomNumber', JSON.stringify({'room': GetRoomNumber(users)}));
  });

  socket.on('disconnect', () => {
    // console.log('close');
  });
};

/**
 * 游戏开始阶段
 * @param socketIO
 * @param socket
 */
let workTypePlay = (socketIO, socket) => {
  let socketId = socket.id;
  let roomId = socket.handshake.query.roomId;
  let roomSocketId = socket.handshake.query.socketId;

  // 1. 连入阶段
  if (! players.get(roomId))
    players.set(roomId, new Center(users.get(roomId), socket));

  socket.join(roomId);

  setInterval(() => {
    socketIO.to(socketId).emit('state', mapToString(users.get(roomId).players));
  }, 120);


  socket.on('state', message => {
    let msg = JSON.parse(message);
    users.get(roomId).get(roomSocketId).timeChange(msg.position, msg.state, msg.blood);
  });
};

/**
 * socketIO连接函数
 * @type {(p1?:*)}
 */
pub.connect = (socketIO => {
  socketIO.on('connection', socket => {
    let pageType = socket.handshake.query.type;
    console.log(socket.handshake.query);
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
      workTypePlay(socketIO, socket);
      break;
    }
  });
});


module.exports = pub;
