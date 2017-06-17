/**
 * Created by CoderSong on 17/6/15.
 */

const Deck = require('./card');
const Role = require('./role');
const User = require('./user').user;

let GAME_STATE = ['BEFORE_START', 'START_STAGE', 'CHOOSE_ROLE', 'DISTRIBUTE_RESOURCE', 'BUILD_HOUSE'];

function  CenterController(roomId, socket) {
  this.roomId = roomId;
  this.users = [];
  this.deck = new Deck();
  this.role = new Role();
  this.state = '';

  /**
   * 判断选择角色是否结束
   * @returns {boolean}
   */
  let chooseRoleOver = () => {
    for (let i = 0; i < this.users.length; i ++)
      if (this.users[i].role === null)
        return false;
    return true;
  };

  /**
   * 判断游戏是否结束
   * @returns {boolean}
   */
  let gameOver = () => {
    for (let i = 0; i < this.users.length; i ++)
      if (this.users[i].regions.length >= 8)
        return true;
    return false;
  };

  /**
   * 判断玩家时间是否结束
   * @returns {boolean}
   */
  let playerTimeOver = () => {
    for (let i = 0; i < this.users.length; i++)
      if (!this.users[i].finish)
        return false;
    return true;
  };

  /**
   * 游戏阶段-选择角色阶段
   */
  let chooseRole = () => {
    this.state = GAME_STATE[2];

    socket.emit('chooseRole', {user: this.users[0].socketId});

    socket.on('chooseRole', msg => {
      let message = JSON.parse(msg);
      // 玩家还没有全部选择完
      if (message.user !== this.users[this.users.length - 1].socketId) {
        socket.emit('chooseRole', {'user': this.users[msg.num++].socketId});

      } else {
        socket.remove('chooseRole');
        // 跳到下一个阶段
        distributeResource();
      }
    });
  };


  let distributeResource = () => {
    this.state = GAME_STATE[3];

    socket.on('resource', msg => {
      let message = JSON.parse(msg);
      // if (message.user !== this.users[this.users.length - 1].socketId)

    })
  };



  /**
   * 游戏阶段-玩家时间阶段
   */
  let playerTime = () => {
    while (! playerTimeOver()) {

    }
  };


  /**
   * 初始化控制器
   * @param users
   */
  this.init = (users) => {
    this.state = GAME_STATE[0];
    // 1. 准备牌堆
    this.deck.initDeck();
    this.deck.shuffleCards();

    // 2. 准备角色堆
    this.role.initRoleDeck(users.size);

    // 3. 角色进行转换
    for (let item of users.entries())
      this.users.push(new User(item[1].name, item[0]));
  };

  /**
   * 初始阶段
   */
  this.workStartStage = () => {
    this.state = GAME_STATE[1];
    for (let i = 0; i < this.users.length; i ++) {
      // 1. 发钱
      this.users[i].getGold(2);
      // 2. 发牌
      for (let j = 0; j < 4; j ++)
        this.users[i].drawCard(this.deck.sendCards());
    }
    this.playStage();
  };
  //
  // /**
  //  * 游戏阶段
  //  */
  // this.playStage = () => {
  //   while (! gameOver()) {
  //
  //   }
  // };



  this.toString = () => {
    return JSON.stringify({game: this.parser()});
  };

  this.parser = () => {
    return {
      users: this.users,
      deck: this.deck.parser(),
      role: this.role.parser(),
      state: this.state
    };
  };
}

module.exports = CenterController;
