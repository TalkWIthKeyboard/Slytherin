/**
 * Created by CoderSong on 17/6/7.
 */

/**
 * 游戏中的玩家类
 */
function User(name, socketId) {
  this.name = name;
  this.cards = [];
  this.regions = [];
  this.gold = 0;
  this.role = null;
  this.socketId = socketId;
  // 玩家是否完成这一次的游戏阶段
  this.finish = false;

  this.chooseRole = (role) => {
    this.role = role;
  };

  this.getGold = (num) => {
    this.gold += num;
  };

  this.drawCard = (card) => {
    this.cards.push(card);
  };

  this.toString = () => {
    return JSON.stringify({user: this.parser()});
  };

  this.update = (user) => {
    this.cards = user.cards;
    this.regions = user.regions;
    this.gold = user.gold;
    this.role = user.role;
  };

  this.parser = () => {
    return {
      name: this.name,
      cards: this.cards,
      regions: this.regions,
      gold: this.gold,
      role: this.role
    };
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
    this.type = ! this.type;
  };
}

module.exports = {
  user: User,
  roomUser: RoomUser
};

