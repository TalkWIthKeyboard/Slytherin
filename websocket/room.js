/**
 * Created by CoderSong on 17/6/8.
 */

function Room(socketId, user, name) {
  // 房间内的玩家
  this.players = new Map();
  // 房间状态 （'Room'是房间准备状态，'Play'是房间游戏开始状态）
  this.type = 'Room';
  // 房间人数上限
  this.number = 2;

  this.joinRoom(socketId, user);

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
   * 游戏开始
   */
  this.gameStart = () => {
    this.type = 'Play';
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

  /**
   * 检查是否还能加入房间
   */
  this.checkJoin = () => {
    return this.players.length < this.number;
  };
}

module.exports = Room;