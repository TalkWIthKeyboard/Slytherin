/**
 * Created by CoderSong on 17/6/7.
 */

/**
 * 用户类
 * @param name 玩家姓名
 * @param position 玩家位置
 * @param camp 玩家的阵营
 * @param state 玩家的状态（状态机）
 * @param blood 玩家的血量
 * @param roomId 玩家所在的房间
 */
function User(name, position, camp, state, blood, roomId) {
  this.name = name;
  this.position = position;
  this.camp = camp;
  this.state = state;
  this.blood = blood;
  this.roomId = roomId;

  /**
   * 随时间改变的量
   * @param _position
   * @param _state
   * @param _blood
   */
  this.timeChange = (_position, _state, _blood) => {
    this.position = _position;
    this.state = _state;
    this.blood = _blood;
  };
}


/**
 * 房间Socket用户类
 * @param name 玩家姓名
 * @param roomId 玩家所在的房间
 */
function RoomUser(name, roomId) {
  this.name = name;
  this.roomId = roomId;
  // 玩家是否准备
  this.type = false;

  /**
   * 改变玩家准备状态
   */
  this.changeType = () => {
    this.type = !this.type;
  }
}

module.exports = {
  user: User,
  roomUser: RoomUser
};

