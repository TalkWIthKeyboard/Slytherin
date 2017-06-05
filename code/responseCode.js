/**
 * Created by CoderSong on 17/6/5.
 */

let pub = {};

pub.warning = {
  'LOGIN_ERROR': {
    message: 'User not logged in !'
  },
  'USER_ERROR': {
    message: 'User account or password error !'
  },
  'CREATE_USER_ERROR': {
    message: 'User name or account already exists !'
  },
};

/**
 * 自定义错误封装器
 * （一般是服务器内部错误，所以默认510）
 * @type {{}}
 */
pub.builder = (msg, status) => {
  let error = new Error(msg);
  error.status = status || 510;
  return error;
};

module.exports = pub;