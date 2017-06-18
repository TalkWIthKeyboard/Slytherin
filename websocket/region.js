/**
 * Created by CoderSong on 17/6/18.
 */

const card_info = require('./card').card_info;

function region() {
  this.color = '';
  this.star = '';

  this.init = (card) => {
    let _card = card_info[card];
    this.color = _card.color;
    this.star = _card.cost;
  }
}