/**
 * Created by CoderSong on 17/6/15.
 */

const Deck = require('./card').deck;
const RoleDeck = require('./role').roleDeck;
const Role = require('./role').role;
const User = require('./user').user;

let GAME_STATE = ['BEFORE_START', 'START_STAGE', 'CHOOSE_ROLE', 'PLAYER_TIME', 'DISTRIBUTE_RESOURCE', 'BUILD_HOUSE'];
let GAME_END_STATE = {
  'CHOOSE_ROLE': 'CHOOSE_ROLE_END',
  'PLAYER_TIME': 'PLAYER_TIME_END'
};

function  CenterController(roomId, users) {
  this.roomId = roomId;
  this.users = [];
  this.deck = new Deck();
  this.role = new RoleDeck();
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
  let buildHouse = (socket) => {
    this.state = GAME_STATE[5];

    // msg: {'user':,'card':,}
    socket.on(this.state, msg => {
      let message = JSON.parse(msg);
      this.users[message.user].buildHouse(message.card);
      socket.emit(this.state, JSON.stringify(this.parser()));
      socket.removeAllListeners(this.state);
    })
  };

  /**
   * 游戏阶段-玩家时间阶段-分配资源
   */
  let distributeResource = (socket, socketIO) => {
    this.state = GAME_STATE[4];

    console.log('deck:', this.deck.optionCards());

    socket.emit('Licensing', JSON.stringify({cards: this.deck.optionCards()}));

    // msg: {'user':, 'choose':, 'num':}
    // choose 1 是选金币,2 是选第一张,3 是选第二张
    socket.on(this.state, msg => {
      let message = JSON.parse(msg);
      // 选择2块金币
      if (message.choose === 1)
        this.users[message.user].getGold(2);
      else
        this.users[message.user].drawCard(this.deck.chooseCards(message.choose - 2));

      socketIO.in(roomId).emit(this.state, JSON.stringify({
        num: message.num++,
        user: this.users[message.usr].socketId,
        info: this.parser()
      }));

      socket.removeAllListeners(this.state);
      buildHouse();
    })
  };

  /**
   * 游戏阶段-玩家时间阶段
   */
  var playerTime = (socket, socketIO) => {
    this.state = GAME_STATE[3];

    // msg: {'user':}
    socket.on(this.state, msg => {
      let message = JSON.parse(msg);
      if (message.user === this.users[this.users.length - 1].socketId)
        socketIO.in(roomId).emit(GAME_END_STATE[this.state]);
      else
        distributeResource(socket, socketIO);
    });

    socket.on(GAME_END_STATE[this.state], () => {
      socket.removeAllListeners(this.state);
      socket.removeAllListeners(GAME_END_STATE[this.state]);
      // chooseRole();
    })
  };

  /**
   * 游戏阶段-选择角色阶段
   */
  var chooseRole = (socket, socketIO) => {
    if (gameOver()) return;

    this.state = GAME_STATE[2];
    socket.emit(this.state, JSON.stringify({
      'user': this.users[0].socketId,
      'num': 0,
      'role': this.role.parser()
    }));

    // msg: {'num':,'role':,'roles':};
    socket.on(this.state, msg => {
      let message = JSON.parse(msg);
      this.users[message.num].chooseRole(new Role(message.role));
      this.role.updateRoleDeck(message.roles);

      console.log('num: ', message.num);
      // 玩家还没有全部选择完
      if (message.num !== this.users.length - 1) {
        socketIO.in(roomId).emit(this.state, JSON.stringify({
          'num': message.num + 1,
          'user': this.users[message.num + 1].socketId,
          'role': this.role.parser()
        }));
      }
      // 所有玩家已经选择完
      else socketIO.in(roomId).emit(GAME_END_STATE[GAME_STATE[2]]);

      playerTime(socket, socketIO);
    });

    socket.on(GAME_END_STATE[this.state], () => {
      socket.removeAllListeners(this.state);
      socket.removeAllListeners(GAME_END_STATE[this.state]);
    })
  };

  /**
   * 初始化控制器
   * @param users
   */
  this.initClass = (users) => {
      this.state = GAME_STATE[0];
      // 1. 准备牌堆
      this.deck.initDeck();
      this.deck.shuffleCards();
      // 2. 准备角色堆 TODO 修改过的
      this.role.initRoleDeck(4);
      // 3. 角色进行转换
      for (let item of users.entries())
        this.users.push(new User(item[1].name, item[0]));

      // 4. 发牌 & 发钱
      for (let i = 0; i < this.users.length; i ++) {
        // 1. 发钱
        this.users[i].getGold(2);
        // 2. 发牌
        for (let j = 0; j < 4; j ++)
          this.users[i].drawCard(this.deck.sendCards());
      }
  };

  /**
   * 初始阶段
   */
  this.workStartStage = (socket, socketIO) => {
    this.state = GAME_STATE[1];
    // 将信息发送到客户端
    socket.emit(this.state, JSON.stringify(this.parser()));
    // 跳转到下一个阶段
    this.playStage(socket, socketIO);
  };

  /**
   * 游戏阶段
   */
  this.playStage = (socket, socketIO) => {
    // while (! gameOver()) {
      // 开始选择角色
      chooseRole(socket, socketIO);
    // }
  };

  this.toString = () => {
    return JSON.stringify({game: this.parser()});
  };

  this.parser = () => {
    let userList = [];
    for (let i = 0; i < this.users.length; i++)
      userList.push(this.users[i].parser());

    return {
      users: userList,
      deck: this.deck.parser(),
      role: this.role.parser(),
      state: this.state
    };
  };


  this.initClass(users);
}

module.exports = CenterController;
