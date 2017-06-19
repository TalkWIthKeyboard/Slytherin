/**
 * Created by CoderSong on 17/6/15.
 */

function Card(cardName) {
  this.cardName = cardName;
}

let CARD_INFO = {
  Laboratory: {
    name: 'Laboratory',
    cn_name: '实验室',
    color: 'purple',
    cost: 5,
    num: 1
  },
  Fortress: {
    name: 'Fortress',
    cn_name: '要塞',
    color: 'purple',
    cost: 3,
    num: 1
  },
  University: {
    name: 'University',
    cn_name: '大学',
    color: 'purple',
    cost: 8,
    num: 1
  },
  GhostTown: {
    name: 'GhostTown',
    cn_name: '鬼城',
    color: 'purple',
    cost: 2,
    num: 1
  },
  Smithy: {
    name: 'Smithy',
    cn_name: '铁匠铺',
    color: 'purple',
    cost: 5,
    num: 1
  },
  Observatory: {
    name: 'Observatory',
    cn_name: '天文台',
    color: 'purple',
    cost: 5,
    num: 1
  },
  MagicSchool: {
    name: 'MagicSchool',
    cn_name: '魔法学校',
    color: 'purple',
    cost: 6,
    num: 1
  },
  Cemetery: {
    name: 'Cemetery',
    cn_name: '坟地',
    color: 'purple',
    cost: 5,
    num: 1
  },
  Wall: {
    name: 'Wall',
    cn_name: '城墙',
    color: 'purple',
    cost: 6,
    num: 1
  },
  DragonDoor: {
    name: 'DragonDoor',
    cn_name: '龙门',
    color: 'purple',
    cost: 8,
    num: 1
  },
  Harbour: {
    name: 'Harbour',
    cn_name: '海港',
    color: 'green',
    cost: 4,
    num: 3,
  },
  Pub: {
    name: 'Pub',
    cn_name: '酒馆',
    color: 'green',
    cost: 1,
    num: 5
  },
  Market: {
    name: 'Market',
    cn_name: '市场',
    color: 'green',
    cost: 2,
    num: 5
  },
  TradingPost: {
    name: 'TradingPost',
    cn_name: '贸易站',
    color: 'green',
    cost: 2,
    num: 2
  },
  Wharf: {
    name: 'Wharf',
    cn_name: '码头',
    color: 'green',
    cost: 3,
    num: 3
  },
  CityHall: {
    name: 'CityHall',
    cn_name: '市政厅',
    color: 'green',
    cost: 5,
    num: 2
  },
  Church: {
    name: 'Church',
    cn_name: '教堂',
    color: 'blue',
    cost: 2,
    num: 3
  },
  Temple: {
    name: 'Temple',
    cn_name: '神殿',
    color: 'blue',
    cost: 1,
    num: 3
  },
  Cathedral: {
    name: 'Cathedral',
    cn_name: '大教堂',
    color: 'blue',
    cost: 5,
    num: 2
  },
  Monastery: {
    name: 'Monastery',
    cn_name: '修道院',
    color: 'blue',
    cost: 3,
    num: 3
  },
  Manor: {
    name: 'Manor',
    cn_name: '庄园',
    color: 'blue',
    cost: 3,
    num: 4
  },
  Palace: {
    name: 'Palace',
    cn_name: '皇宫',
    color: 'yellow',
    cost: 5,
    num: 3
  },
  Castle: {
    name: 'Castle',
    cn_name: '城堡',
    color: 'yellow',
    cost: 4,
    num: 4
  },
  LookoutTower: {
    name: 'LookoutTower',
    cn_name: '瞭望台',
    color: 'red',
    cost: 1,
    num: 3
  },
  Prison: {
    name: 'Prison',
    cn_name: '监狱',
    color: 'red',
    cost: 2,
    num: 3
  },
  Battlefield: {
    name: 'Battlefield',
    cn_name: '战场',
    color: 'red',
    cost: 3,
    num: 3
  },
  Bastion: {
    name: 'Bastion',
    cn_name: '堡垒',
    color: 'red',
    cost: 5,
    num: 2
  }
};

function Deck() {

  this.cards = [];
  this.cardNum = 0;

  /**
   * 初始化牌堆
   */
  this.initDeck = async () => {
    for (let i in CARD_INFO) {
      let each = CARD_INFO[i];
        for (let j = 0; j < each.num; j ++)
          this.cards.push(new Card(i));
    }
  };

  /**
   * 洗牌
   */
  this.shuffleCards = () => {
    let len = this.cards.length - 1;
    for (let i = 0; i < len; i ++) {
      let positionA = Math.round(Math.random() * len);
      let positionB = Math.round(Math.random() * len);
      let _card = this.cards[positionA];
      this.cards[positionA] = this.cards[positionB];
      this.cards[positionB] = _card;
    }
  };

  /**
   * 发牌
   */
  this.sendCards = () => {
    let card = this.cards[this.cardNum];
    this.cardNum++;
    return card;
  };

  /**
   * 拿两张牌选一张放在牌堆底部
   * @param choose 0是第一张 1是第二张
   */
  this.chooseCards = (choose) => {
    // 被选的牌
    let cardA = this.cards[this.cardNum + choose];
    // 没有被选的牌
    let cardB = this.cards[this.cardNum + !choose];
    this.cardNum += 2;
    this.cards.push(cardB);
    return cardA;
  };

  /**
   * 备选的两张牌
   * @returns {[*,*]}
   */
  this.optionCards = () => {
    return [this.cards[this.cardNum], this.cards[this.cardNum + 1]];
  };

  /**
   * 更新牌堆
   * @param msg
   */
  this.updateDeck = (msg) => {
    this.cards = JSON.parse(msg).deck;
  };

  this.toString = () => {
    return JSON.stringify({desk: this.parser()});
  };

  this.parser = () => {
    return {
      deck: this.cards,
      cardNum: this.cardNum
    };
  };
}

module.exports = {
  deck: Deck,
  card_info: CARD_INFO
};

