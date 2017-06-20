/**
 * Created by CoderSong on 17/6/7.
 */

const Region = require('./region');
const card_info = require('./card').card_info;

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
  // 玩家是否要被翻牌
  this.open = false;
  // 玩家是否使用技能
  this.skill = false;

  this.chooseRole = (role) => {
    this.role = role;
  };

  this.getGold = (num) => {
    this.gold += num;
  };

  this.drawCard = (card) => {
    this.cards.push(card);
  };

  this.buildHouse = (card) => {
    this.gold -= card_info[card].cost;
    for (let i = 0; i < cards.length; i++)
      if (card.cardName === cards[i].cardName) cards.splice(i,1);
    this.regions.push(new Region(card));
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
      role: this.role,
      socketId: this.socketId
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

