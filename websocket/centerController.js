/**
 * Created by CoderSong on 17/6/15.
 */

const Deck = require('./card').deck;
const Role = require('./role');
const User = require('./user').user;

let GAME_STATE = ['BEFORE_START', 'START_STAGE', 'CHOOSE_ROLE', 'PLAYER_TIME', 'DISTRIBUTE_RESOURCE', 'BUILD_HOUSE'];

function  CenterController(roomId, socketIO, socket) {
  this.roomId = roomId;
  this.users = [];
  this.deck = new Deck();
  this.role = new Role();
  this.state = '';

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
   * 游戏阶段-玩家时间阶段-修建建筑
   */
  let buildHouse = () => {
    this.state = GAME_STATE[5];

    // msg: {'user':,'card':,}
    socket.on(this.state, msg => {
      let message = JSON.parse(msg);
      this.users[message.user].buildHouse(message.card);
      socket.emit(this.state, JSON.stringify(this.parser()));
      socket.remove(this.state);
    })
  };

  /**
   * 游戏阶段-玩家时间阶段-分配资源
   */
  let distributeResource = () => {
    this.state = GAME_STATE[4];

    // msg: {'user':, 'choose':}
    // choose 1 是选金币,2 是选第一张,3 是选第二张
    socket.on(this.state, msg => {
      let message = JSON.parse(msg);
      // 选择2块金币
      if (message.choose === 1)
        this.users[message.user].getGold(2);
      else {
        this.users[message.user].drawCard(this.deck.chooseCards(message.choose - 2));
        socket.emit(this.state, JSON.stringify(this.parser()));
        socket.remove(this.state);
        buildHouse();
      }
    })
  };

  /**
   * 游戏阶段-玩家时间阶段
   */
  var playerTime = () => {
    this.state = GAME_STATE[3];

    socket.emit(this.state, JSON.stringify({user: this.users[0].socketId}));

    // msg: {'user':}
    socket.on(this.state, msg => {
      let message = JSON.parse(msg);
      if (message.user !== this.users[this.users.length - 1].socketId) {
        distributeResource();
      } else {
        socket.remove(this.state);
        // 跳到下一个阶段的选择角色
        chooseRole();
      }
    })
  };

  /**
   * 游戏阶段-选择角色阶段
   */
  var chooseRole = () => {
    if (gameOver()) return;

    this.state = GAME_STATE[2];

    socket.emit(this.state, JSON.stringify({
      'user': this.users[0].socketId,
      'role': this.role.parser()
    }));

    // msg: {'user':,'role':,'roles':};
    socket.on(this.state, msg => {
      let message = JSON.parse(msg);
      // 玩家还没有全部选择完
      if (message.user !== this.users[this.users.length - 1].socketId) {
        this.users[message.user].chooseRole(message.role);
        this.role.updateRoleDeck(message.role);
        socketIO.in(roomId).emit(this.state, JSON.stringify({
          'user': this.users[msg.num++].socketId,
          'role': this.role.parser()
        }));
      }
      // 所有玩家已经选择完
      else {
        socket.remove(this.state);
        // 跳到下一个阶段
        playerTime();
      }
    });
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
    // 4.跳转到下一个阶段
    this.workStartStage();
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
    // 将信息发送到客户端
    socket.emit(this.state, JSON.stringify(this.parser()));
    // 跳转到下一个阶段
    this.playStage();
  };

  /**
   * 游戏阶段
   */
  this.playStage = () => {
    while (! gameOver()) {
      // 开始选择角色
      chooseRole();
    }
  };

  this.toString = () => {
    return JSON.stringify({game: this.parser()});
  };

  this.parser = () => {
    let userList = [];
    for (let i = 0; i < this.users.length; i++)
      userList.push(user.parser());

    return {
      users: userList,
      deck: this.deck.parser(),
      role: this.role.parser(),
      state: this.state
    };
  };
}

module.exports = CenterController;
