var superagent = require("superagent");

function getToken(appid, secret, callback){
	// "appid": "wx3bb8862c839a2f92"
	// "secret": "3dad157def4b963c558cbe4bc0bb0b5e"
	superagent.get("https://api.weixin.qq.com/cgi-bin/token")
		.query({
			"grant_type": "client_credential",
			"appid": appid,
			"secret": secret
		})
		.end(function(err, res) {
			if (err) {
				return console.error(err);
			}
			if (res.ok) {
				var token = JSON.parse(res.text);
				console.log(token);
				
				if(callback){
					callback(token);
				}
			}
		});
}
module.exports = getToken;