/**
 * Created by CoderSong on 17/6/8.
 */

const User = require('./user').user;

function Room(socketId, user, name, number) {
  // 房间内的玩家
  this.players = new Map();
  // 房间人数上限
  this.number = number;
  this.name = name;

  /**
   * 玩家加入房间
   * @param socketId
   * @param user
   */
  this.joinRoom = (socketId, user) => {
    this.players.set(socketId, user);
  };

  /**
   * 玩家退出房间
   * @param socketId
   */
  this.exitRoom = (socketId) => {
    this.players.delete(socketId);
  };

  /**
   * 将待机玩家转换为游戏玩家
   */
  let transform = () => {
    let _players = new Map();
    for (let item in this.players.entries()) {
      let position = {};
      let camp = '';
      let state = '';
      _players.set(item[0], new User(item[1].name, position, camp, state, 100, item[1].roomId));
    }
    this.players = _players;
  };

  /**
   * 检查游戏是否可以开始
   */
  this.checkStart = () => {
    if (this.players.length !== this.number) return false;
    for (let item of this.players.entries())
      if (item[1].type !== true) return false;
    return true;
  };

  this.joinRoom(socketId, user);
}

module.exports = Room;
