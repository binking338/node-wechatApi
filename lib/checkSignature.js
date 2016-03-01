var crypto = require("crypto");

function checkSignature(signature, timestamp, nonce, token){
	// 按照字典排序
	var array = [token, timestamp, nonce];
	array.sort();
	
    var msg = crypto.createHash("sha1").update(array.join("")).digest("hex");
	
	// 对比签名
	if(msg == signature) {
		return true;
	} else {
		return false;
	}
}

module.exports = checkSignature;