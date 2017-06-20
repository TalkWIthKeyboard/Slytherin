/**
 * Created by CoderSong on 17/6/15.
 */

function Role(roleName) {
  this.roleName = roleName;
}

let ROLE_INFO = {
  'ASSASSIN': {
    name: 'Assassin',
    cn_name: '刺客',
    number: 1,
  },
  'THIEF': {
    name: 'Thief',
    cn_name: '盗贼',
    number: 2
  },
  'MAGICIAN': {
    name: 'Magician',
    cn_name: '魔法师',
    number: 3
  },
  'KING': {
    name: 'King',
    cn_name: '国王',
    number: 4
  },
  'BISHOP': {
    name: 'Bishop',
    cn_name: '主教',
    number: 5
  },
  'BUSINESSMAN': {
    name: 'Businessman',
    cn_name: '商人',
    number: 6
  },
  'ARCHITECT': {
    name: 'Architect',
    cn_name: '建筑师',
    number: 7
  },
  'WARLORD': {
    name: 'Warlord',
    cn_name: '军阀',
    number: 8
  }
};

let ROLE_NUM = {
  4: 2,
  5: 1,
  6: 0,
  7: 0
};

function RoleDeck() {

  this.roles = {};
  this.roles['normal'] = [];
  // 反面弃置
  this.roles['reversal'] = null;
  // 正面弃置
  this.roles['front'] = [];
  // 被选择的牌
  this.roles['choose'] = [];

  /**
   * 初始化角色牌堆
   * @param num 人数
   */
  this.initRoleDeck = (num) => {
    this.roles['normal'] = [];
    // 反面弃置
    this.roles['reversal'] = null;
    // 正面弃置
    this.roles['front'] = [];
    // 被选择的牌
    this.roles['choose'] = [];

    for (let i in ROLE_INFO)
       this.roles.normal.push(new Role(i));

    let len = this.roles.normal.length - 1;
    // 1. 挑选一张牌将其反置
    let positionA = Math.round(Math.random() * len);
    this.roles.reversal = this.roles.normal[positionA];
    this.roles.normal.splice(positionA, 1);
    len --;

    // 2. 挑选牌将其正置
    for (let i = 0; i < ROLE_NUM[num]; i ++) {
      positionA = Math.round(Math.random() * len);
      this.roles.front.push(this.roles.normal[positionA]);
      this.roles.normal.splice(positionA, 1);
      len --;
    }
  };

  /**
   * 更新角色牌堆
   * @param obj
   */
  this.updateRoleDeck = (obj) => {
    this.roles.normal = obj.normal;
    this.roles.choose = obj.choose;
  };

  this.toString = () => {
    return JSON.stringify({roles: this.parser()});
  };

  this.parser = () => {
    return this.roles;
  };
}

module.exports = {
  roleDeck: RoleDeck,
  role: Role,
  roleInfo: ROLE_INFO
};
