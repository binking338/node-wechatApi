var checkSignature = require('./lib/checkSignature.js'),
	getToken = require('./lib/getToken.js'),
	message = require('./lib/message.js'),
	events = require('events');

function wechatApi(config) {
	this.config = typeof(config) === 'string' ? {
		'token': config
	} : config;
	this.emitter = new events.EventEmitter();
	this.message = new message(config.userName);
};

wechatApi.midware = {
	'express': function(config, callback) {
		/*var config = {
		 *  'token': 'token',
		 *  'userName': 'gebixw',
		 *  'appid': 'appid',
		 *  'encodingAESKey': 'encodinAESKey'
		 * };
		 */
		var api = arguments.callee.api = new wechatApi(config);
		if (callback) callback(api);

		return function(req, res, next) {
			if (req.method === "GET") {
				var signature = req.query['signature'];
				var timestamp = req.query['timestamp'];
				var nonce = req.query['nonce'];
				var echostr = req.query['echostr'];
				res.send(api.checkSignature(signature, timestamp, nonce, api.config.token) ? echostr : '');
			} else if (req.method === "POST") {
				req.setEncoding('utf8');

				var xml = '';
				req.on('data', function(chunk) {
					xml += chunk;
				});
				req.on('end', function() {
					api.accept(xml, function(echoXml) {
						res.type('text/xml');
						res.send(echoXml);
					});
				});
			}
		};
	}
};

wechatApi.prototype.checkSignature = checkSignature;

// 接受消息
wechatApi.prototype.accept = function(msg, sendHandle) {
	var self = this;
	this.message.recieveXml2Object(msg, function(data) {
		self.emitter.emit(data.MsgType, data, sendHandle);
	});
};

//监听文本信息
wechatApi.prototype.text = function(callback) {
	this.emitter.on("text", callback);
	return this;
};

//监听图片信息
wechatApi.prototype.image = function(callback) {
	this.emitter.on("image", callback);
	return this;
};

//监听地址信息
wechatApi.prototype.location = function(callback) {
	this.emitter.on("location", callback);
	return this;
};

//监听链接信息
wechatApi.prototype.link = function(callback) {
	this.emitter.on("link", callback);
	return this;
};

//监听事件信息
wechatApi.prototype.event = function(callback) {
	this.emitter.on("event", callback);
	return this;
};

//监听语音信息
wechatApi.prototype.voice = function(callback) {
	this.emitter.on("voice", callback);
	return this;
};

//监听视频信息
wechatApi.prototype.video = function(callback) {
	this.emitter.on("video", callback);
	return this;
};

//监听所有信息
wechatApi.prototype.all = function(callback) {
	this.emitter.on("text", callback);
	this.emitter.on("image", callback);
	this.emitter.on("location", callback);
	this.emitter.on("link", callback);
	this.emitter.on("event", callback);
	this.emitter.on("voice", callback);
	this.emitter.on("video", callback);

	return this;
};

module.exports = wechatApi;