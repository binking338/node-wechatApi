var xml2js = require('xml2js');

function msg2Xml(data) {
	//自动检测 MsgType
	var MsgType = "";
	if (!data.MsgType) {
		if (data.hasOwnProperty("Content")) MsgType = "text";
		else if (data.hasOwnProperty("MusicUrl")) MsgType = "music";
		else if (data.hasOwnProperty("Articles")) MsgType = "news";
	} else {
		MsgType = data.MsgType;
	}

	var msg = "" +
		"<xml>" +
		"<ToUserName><![CDATA[" + data.ToUserName + "]]></ToUserName>" +
		"<FromUserName><![CDATA[" + data.FromUserName + "]]></FromUserName>" +
		"<CreateTime>" + Math.floor(Date.now() / 1000) + "</CreateTime>" +
		"<MsgType><![CDATA[" + MsgType + "]]></MsgType>";

	switch (MsgType) {
		case 'text':
			msg += "" +
				"<Content><![CDATA[" + (data.Content || '') + "]]></Content>" +
				"</xml>";
			return msg;

		case 'image':
			msg += "" +
				"<Image>" +
				"<MediaId><![CDATA[" + data.MediaId + "]]></MediaId>" +
				"</Image>" +
				"</xml>";
			return msg;

		case 'voice':
			msg += "" +
				"<Voice>" +
				"<MediaId><![CDATA[" + data.MediaId + "]]></MediaId>" +
				"</Voice>" +
				"</xml>";
			return msg;

		case 'video':
			msg += "" +
				"<Video>" +
				"<MediaId><![CDATA[" + data.MediaId + "]]></MediaId>" +
				"<Title><![CDATA[" + (data.Title || '') + "]]></Title>" +
				"<Description><![CDATA[" + (data.Description || '') + "]]></Description>" +
				"</Video>" +
				"</xml>";
			return msg;

		case 'music':
			msg += "" +
				"<Music>" +
				"<Title><![CDATA[" + (data.Title || '') + "]]></Title>" +
				"<Description><![CDATA[" + (data.Description || '') + "]]></Description>" +
				"<MusicUrl><![CDATA[" + (data.MusicUrl || '') + "]]></MusicUrl>" +
				"<HQMusicUrl><![CDATA[" + (data.HQMusicUrl || data.MusicUrl || '') + "]]></HQMusicUrl>" +
				"<ThumbMediaId><![CDATA[" + (data.ThumbMediaId || '') + "]]></ThumbMediaId>" +
				"</Music>" +
				"</xml>";
			return msg;

		case 'news':
			var ArticlesStr = "";
			var ArticleCount = data.Articles.length;
			for (var i in data.Articles) {
				ArticlesStr += "" +
					"<item>" +
					"<Title><![CDATA[" + (data.Articles[i].Title || '') + "]]></Title>" +
					"<Description><![CDATA[" + (data.Articles[i].Description || '') + "]]></Description>" +
					"<PicUrl><![CDATA[" + (data.Articles[i].PicUrl || '') + "]]></PicUrl>" +
					"<Url><![CDATA[" + (data.Articles[i].Url || '') + "]]></Url>" +
					"</item>";
			}

			msg += "<ArticleCount>" + ArticleCount + "</ArticleCount>" +
				"<Articles>" + ArticlesStr + "</Articles>" +
				"</xml>";
			return msg;
	}
}

function message(userName) {
	this.userName = userName;
}

message.prototype.recieveXml2Object = function(xml, callback) {
	var msg = {};
	xml2js.parseString(xml, function(err, result) {
		var data = result.xml;

		msg.ToUserName = data.ToUserName[0];
		msg.FromUserName = data.FromUserName[0];
		msg.CreateTime = data.CreateTime[0];
		msg.MsgType = data.MsgType[0];

		switch (msg.MsgType) {
			case 'text':
				msg.Content = data.Content[0];
				msg.MsgId = data.MsgId[0];

				callback(msg);
				break;

			case 'image':
				msg.PicUrl = data.PicUrl[0];
				msg.MsgId = data.MsgId[0];
				msg.MediaId = data.MediaId[0];

				callback(msg);
				break;

			case 'voice':
				msg.MediaId = data.MediaId[0];
				msg.Format = data.Format[0];
				msg.MsgId = data.MsgId[0];

				callback(msg);
				break;

			case 'video':
				msg.MediaId = data.MediaId[0];
				msg.ThumbMediaId = data.ThumbMediaId[0];
				msg.MsgId = data.MsgId[0];

				callback(msg);
				break;

			case 'location':
				msg.Location_X = data.Location_X[0];
				msg.Location_Y = data.Location_Y[0];
				msg.Scale = data.Scale[0];
				msg.Label = data.Label[0];
				msg.MsgId = data.MsgId[0];

				callback(msg);
				break;

			case 'link':
				msg.Title = data.Title[0];
				msg.Description = data.Description[0];
				msg.Url = data.Url[0];
				msg.MsgId = data.MsgId[0];

				callback(msg);
				break;

			case 'event':
				msg.Event = data.Event[0];
				switch (msg.Event) {
					case 'subscribe':
					case 'SCAN':
						msg.EventKey = data.EventKey[0];
						msg.Ticket = data.Ticket;
						break;
					case 'LOCATION':
						msg.Latitude = data.Latitude[0];
						msg.Longitude = data.Longitude[0];
						msg.Precision = data.Precision[0];
						break;
					case 'CLICK':
					case 'VIEW':
						msg.EventKey = data.EventKey[0];
						break;
				}
				callback(msg);
				break;
		}
	});
	return msg;
};

message.prototype.createText = function(toUserName, content) {
	return msg2Xml({
		"ToUserName": toUserName,
		"FromUserName": this.userName,
		"MsgType": "text",
		"Content": content
	});
};

message.prototype.createImage = function(toUserName, mediaId) {
	return msg2Xml({
		"ToUserName": toUserName,
		"FromUserName": this.userName,
		"MsgType": "image",
		"MediaId": mediaId
	});
};

message.prototype.createVoice = function(toUserName, mediaId) {
	return msg2Xml({
		"ToUserName": toUserName,
		"FromUserName": this.userName,
		"MsgType": "voice",
		"MediaId": mediaId
	});
};

message.prototype.createVideo = function(toUserName, mediaId, title, description) {
	return msg2Xml({
		"ToUserName": toUserName,
		"FromUserName": this.userName,
		"MsgType": "video",
		"MediaId": mediaId,
		"Title": title,
		"Description": description
	});
};

message.prototype.createMusic = function(toUserName, title, description, musicUrl, HQMusicUrl, thumbMediaId) {
	return msg2Xml({
		"ToUserName": toUserName,
		"FromUserName": this.userName,
		"MsgType": "music",
		"Title": title,
		"Description": description,
		"MusicUrl": musicUrl,
		"HQMusicUrl": HQMusicUrl,
		"ThumbMediaId": thumbMediaId
	});
};

message.prototype.createNews = function(toUserName, articleCount, articles) {
	return msg2Xml({
		"ToUserName": toUserName,
		"FromUserName": this.userName,
		"MsgType": "news",
		"ArticleCount": articleCount,
		"Articles": articles
	});
};

message.prototype.createArticle = function(title, description, picUrl, url) {
	return {
		"Title": title,
		"Description": description,
		"PicUrl": picUrl,
		"Url": url
	};
};

module.exports = message;