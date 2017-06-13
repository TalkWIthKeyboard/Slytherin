const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const session = require('koa-session-minimal');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const io = require('socket.io');
const work = require('./websocket/connector');
const middle = require('./servers/middlewareServer');

const router = require('./routes/index');

// 0. 配置数据库
mongoose.connect('mongodb://115.159.1.222:27016/Slytherin');

// 1. error handler
onerror(app);
app.use(middle.errorHandler());

// 2. 配置cookie
let cookie = {
  maxAge: 1800000, // cookie有效时长
  // path: '/index', // 写cookie所在的路径
  // domain: 'localhost', // 写cookie所在的域名
  httpOnly: false, // 是否只用于http请求中获取
  overwrite: false,  // 是否允许重写
};

// 3. middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

app.use(views(__dirname + '/views', {
  extension: 'pug'
}));

app.use(session({
  key: 'SlytherinGame',
  cookie: cookie
}));

app.use(middle.checkLogin());
app.use(router.routes(), router.allowedMethods());

// 4.logger
app.use(async(ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});

// 5. 创建WebSocketServer:
let server = app.listen(5000);
let socketIO = io(server);
work.connect(socketIO);


module.exports = app;
