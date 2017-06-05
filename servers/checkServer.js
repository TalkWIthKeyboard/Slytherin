/**
 * Created by CoderSong on 17/6/5.
 */
/**
 * Created by CoderSong on 17/4/25.
 */

const _ = require('underscore');
const response = require('./responseServer');
const error = require('./../code/responseCode');
let pub = {};


/**
 * 对body参数进行检查（有三种检查方式，一种是传入model，一种是传入keyList，一种是两种混合）
 * @param body
 * @param model
 * @param keyList
 * @param scb
 * @param fcb
 */
let checkBody = (body, model, keyList, scb, fcb) => {
  let attr = {};
  if (! body || (! model && ! keyList)) return fcb();
  // 构造所有待检查的属性
  if (keyList)
    _.each(keyList, (value) => {
      attr[value] = false;
    });
  else if (model) {
    let modelObj = model.schema.obj;
    delete modelObj.meta;
    _.each(_.keys(modelObj), (value) => {
      attr[value] = false;
    });
  }


  // 开始进行检查
  let flag = true;
  _.each(_.keys(body), (key) => {
    attr[key] = true;
  });
  _.each(_.values(attr), (value) => {
    flag &= value;
  });

  flag ? scb(body) : fcb('Body check err!');
};

/**
 * 对url中的参数进行检查
 * @param params
 * @param query
 * @param keyList
 * @param queryList
 * @param scb
 * @param fcb
 */
let checkParams = (params, query, keyList, queryList, scb, fcb) => {
  let attr = {};
  if ((! params || ! keyList) && (! queryList || ! query)) return fcb();
  let flag = true;
  params.push(query);
  keyList.push(queryList);

  _.each(keyList, (value) => {
    attr[value] = false;
  });
  if (params)
    _.mapObject(params, (value, key) => {
      attr[key] = true;
    });

  _.each(_.values(attr), (value) => {
    flag &= value;
  });

  flag ? scb([params, query]) : fcb('Params check err!');
};

/**
 * 保存对象
 * @param ctx
 * @param body 对象数据
 * @param model
 * @param cb
 */
pub.saveObj = async (ctx, body, model) => {

  let data = {};
  let modelObj = model.schema.obj;
  delete modelObj.meta;

  // 过滤掉其它不在类中的属性
  _.each(body, (value, key) => {
    if (_.indexOf(modelObj, key))
      data[key] = value;
  });

  try {
    let _model = new model(data);
    let res = await _model.save();
    await response.resSuccessBuilder(ctx, res)
  } catch (err) {
    throw error.builder(err);
  }
};

// 构造两个promise对象
pub.checkBodyPromise = (body, model, keyList) => {
  return new Promise((resolve, reject) => {
    checkBody(body, model, keyList,
      body => resolve(body),
      err => reject(err)
    )});
};

pub.checkParamsPromise = (params, query, keyList, queryList) => {
  return new Promise((resolve, reject) => {
    checkParams(params, query, keyList, queryList,
      params => resolve(params),
      err => reject(err)
    )});
};

module.exports = pub;
