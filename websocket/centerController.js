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
    for (let i = 0; i < this.users.length; i++)
      if (this.users[i].role === null)
        return false;
    return true;
  };

  /**
   * 判断游戏是否结束
   * @returns {boolean}
   */
  let gameOver = () => {
    for (let i = 0; i < this.users.length; i++)
      if (this.users[i].regions.length >= 8)
        return true;
    return false;
  };


  let chooseRole = () => {
    socket.on(`chooseRole ${roomId}`, msg => {
      let message = JSON.parse(msg);
      
    });

    while (!chooseRoleOver()) {

    }

    socket.remove(`chooseRole ${roomId}`);
  };


  /**
   * 初始化控制器
   * @param users
   */
  this.init = (users) => {
    // 1. 准备牌堆
    this.deck.initDeck();
    this.deck.shuffleCards();

    // 2. 准备角色堆
    this.role.initRoleDeck(users.size);

    // 3. 角色进行转换
    for (let item of users.entries())
      this.users.push(new User(item[1].name));

    this.state = '';
  };

  /**
   * 初始阶段
   */
  this.workStartStage = () => {
    this.state = GAME_STATE[1];
    for (let i = 0; i < this.users.length; i++) {
      // 1. 发钱
      this.users[i].getGold(2);
      // 2. 发牌
      for (let j = 0; j < 4; j++)
        this.users[i].drawCard(this.deck.sendCards());
    }
  };

  /**
   *
   */
  this.playStage = () => {
    while (!gameOver()) {

    }
  };

  this.toString = () => {
    return JSON.stringify({game: this.parser()})
  };

  this.parser = () => {
    return {
      users: this.users,
      deck: this.deck.parser(),
      role: this.role.parser(),
      state: this.state
    }
  }
}