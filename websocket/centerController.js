/**
 * Created by CoderSong on 17/6/15.
 */

const Deck = require('./card').deck;
const RoleDeck = require('./role').roleDeck;
const Role = require('./role').role;
const RoleInfo = require('./role').roleInfo;
const User = require('./user').user;

let GAME_STATE = ['BEFORE_START', 'START_STAGE', 'CHOOSE_ROLE', 'PLAYER_TIME', 'D_RESOURCE', 'BUILD_HOUSE'];
let GAME_END_STATE = {
  'CHOOSE_ROLE': 'CHOOSE_ROLE_END',
  'PLAYER_TIME': 'PLAYER_TIME_END'
};

function  CenterController(roomId, users) {
  this.roomId = roomId;
  this.users = [];
  this.deck = new Deck();
  this.role = new RoleDeck();
  // 上一轮谁是国王
  this.king = 0;

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
  let buildHouse = (socket, socketIO) => {
    let state = GAME_STATE[5];

    // msg: {'user':,'num':,'card':}
    socket.on(state, msg => {
      let message = JSON.parse(msg);
      //
      if (msg.card) this.users[message.num].buildHouse(message.card);
      socketIO.in(roomId).emit(state, JSON.stringify({
        num: message.num,
        info: this.parser()
      }));
      socket.removeAllListeners(state);
    })
  };

  /**
   * 游戏阶段-玩家时间阶段-分配资源
   */
  let distributeResource = (socket, socketIO, user) => {
    let state = GAME_STATE[4];

    socket.emit('Licensing', JSON.stringify({cards: this.deck.optionCards()}));

    // 寻找用户信息
    for (let i = 0; i < this.users.length; i++)
      if (this.users[i].socketId === user) {
        this.users[i].open = true;
        break;
      }

    socketIO.in(roomId).emit('ShowRole', JSON.stringify(this.parser()));

    // msg: {'user':, 'choose':, 'num':}
    // choose 1 是选金币,2 是选第一张,3 是选第二张
    socket.on('ChooseCard', msg => {
      let message = JSON.parse(msg);
      // 选择2块金币
      if (message.choose === 1)
        this.users[message.num].getGold(2);
      else
        this.users[message.num].drawCard(this.deck.chooseCards(message.choose - 2));

      socketIO.in(roomId).emit('ChooseCard', JSON.stringify({
        num: message.num,
        user: message.user,
        info: this.parser()
      }));

      socket.removeAllListeners('ChooseCard');
      buildHouse(socket, socketIO);
    });

  };

  /**
   * 重新排序
   * @param users
   */
  var reSort = (users) => {
    // 1. 排列回原来的次序
    users.sort((a, b) => {
      return a.position > b.position;
    });

    // 2. 寻找国王
    for (let i = 0; i < users.length; i++)
      if (users[i].role.roleName === 'KING') {
        this.king = i;
        break;
      }

    // 3. 对后面的进行排序
    for (let i = this.king + 1; i < users.length; i++) users[i].sortNum = i - this.king + 1;
    users[this.king].sortNum = 0;
    // 4. 对前面的进行排序
    for (let i = 0; i < this.king; i++) users[i].sortNum = i + users.length - this.king;
    users.sort((a, b) => {
      return a.sortNum > b.sortNum;
    });
  };

  /**
   * 游戏阶段-玩家时间阶段
   */
  var playerTime = (socket, socketIO) => {
    let state = GAME_STATE[3];

    // msg: {'user':}
    socket.on(state, msg => {
      let message = JSON.parse(msg);

      if (message.user === '1' || message.user === '2') {
        if (message.user === '1') {
          // 排序为原来的顺序
          reSort(this.users);
          // 一回合的结束
          for (let i = 0; i < this.users.length; i++) {
            this.users[i].role = null;
            this.users[i].open = false;
            this.users[i].skill = false;
          }
          // 角色牌堆更新
          this.role.initRoleDeck(4);
          socketIO.in(roomId).emit('ShowRoleAndMessage', JSON.stringify({'users': this.users}));
        }
        socket.removeAllListeners(state);
        chooseRole(socket, socketIO);
      } else
        distributeResource(socket, socketIO, message.user);
    });

    // msg: {'user':, 'num':}
    socket.on('Skill', msg => {
      // 技能附带效果
      let message = JSON.parse(msg);
      this.users[msg.num].skill = true;
      // 继续广播
    });
  };

  /**
   * 游戏阶段-选择角色阶段
   */
  var chooseRole = (socket, socketIO) => {
    let state = GAME_STATE[2];

    socket.emit(state, JSON.stringify({
      'user': this.users[0].socketId,
      'num': 0,
      'role': this.role.parser()
    }));

    // msg: {'num':,'role':,'roles':};
    socket.on(state, msg => {
      let message = JSON.parse(msg);
      this.users[message.num].chooseRole(new Role(message.role.roleName));
      this.role.updateRoleDeck(message.roles);

      // 玩家还没有全部选择完
      if (message.num !== this.users.length - 1) {
        socketIO.in(roomId).emit(state, JSON.stringify({
          'num': message.num + 1,
          'user': this.users[message.num + 1].socketId,
          'role': this.role.parser()
        }));
      }
      // 所有玩家已经选择完
      else {
        this.users.sort((a, b) => {
          return RoleInfo[a.role.roleName].number > RoleInfo[b.role.roleName].number
        });
        socketIO.in(roomId).emit(
          GAME_END_STATE[GAME_STATE[2]],
          JSON.stringify({'users': this.users})
        );
      }

      playerTime(socket, socketIO);
    });

    socket.on(GAME_END_STATE[state], () => {
      socket.removeAllListeners(state);
      socket.removeAllListeners(GAME_END_STATE[state]);
    })
  };

  /**
   * 初始化控制器
   * @param users
   */
  this.initClass = (users) => {
      let state = GAME_STATE[0];
      // 1. 准备牌堆
      this.deck.initDeck();
      this.deck.shuffleCards();
      // 2. 准备角色堆 TODO 修改过的
      this.role.initRoleDeck(4);
      // 3. 角色进行转换
      let i = 0;
      for (let item of users.entries()) {
        let _user = new User(item[1].name, item[0]);
        _user.position = i;
        i++;
        this.users.push(_user);
      }

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
    let state = GAME_STATE[1];
    // 将信息发送到客户端
    socket.emit(state, JSON.stringify(this.parser()));
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
    };
  };


  this.initClass(users);
}

module.exports = CenterController;
