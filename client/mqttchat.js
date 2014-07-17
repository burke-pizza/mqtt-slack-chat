var chatPlugin = (function(){ "use strict";

var client;
var UUID;
var mqttUsername;
var mqttPassword;

/* grab the Paho MQTT Javascript client and CryptoMD5.js */

function loadMD5() {
	var head = document.getElementsByTagName("head")[0];
	var script = document.createElement("script");
	script.src = "http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/md5.js";
	script.type = "text/javascript";
	console.log("grabbing Crypto.js");
	script.onload = createUUID;
	head.appendChild(script);	
}

function createUUID() {
	if (!UUID) {
		generateUUID();
	}
	console.log("UUID: " + UUID);
}

function listenOnInput() {
	var input = document.getElementById("mqttchatinput");

	input.addEventListener("keypress", function(e) {
		var message = input.value;
		//make sure there aren't any anti-mqtt shenanigans in the string
		//listen for enter key and don't send blank messages
		if (e.keyCode == 13 && message) {
			var body = document.getElementById("mqttchatbody");
			body.innerHTML += '<span class="mqttchatmessage">You: '+message+ '</span><br/>';
			body.scrollTop += 100;

			//protection against anti-json quotes
			message = message.replace(/\"/g, '\\"');
			publishMessage(message);

			input.value = "";
			e.preventDefault();
		}
	});
	connectClient();
}

function connectClient() {
	var md5hash = CryptoJS.MD5(mqttPassword);
	client = new Paho.MQTT.Client("q.thingfabric.com", 4483, UUID);
	client.onMessageArrived = onMessageArrived;
	client.onConnectionLost = onConnectionLost;
	var lastWill = new Paho.MQTT.Message('{"ID":"'+UUID+'", "status":"disconnect"}');
	lastWill.destinationName = "hy5t13ak/chat/"+UUID;
	client.connect({
		userName: mqttUsername,
		password: md5hash.toString(CryptoJS.enc.utf8),
		keepAliveInterval: 30,
		onSuccess: onSuccess,
		onFailure: onFailure,
		useSSL: true,
		willMessage: lastWill
	});
}

function onMessageArrived(message) {
	var json = JSON.parse(message.payloadString);
	if (json.sender == "2lemetry") {
		var body = document.getElementById("mqttchatbody");
		body.innerHTML += '<span class="mqttchatmessage">Support: '+ json.text + '</span><br/>';
		body.scrollTop += 100;		
	}
}

function onConnectionLost(e) {
	console.log("Connection lost, reconnecting...");
	var body = document.getElementById("mqttchatbody");
	body.innerHTML += '<span class="mqttchatmessage">Looks like you lost connection to the chat service. Hang on while we try to reconnect you...</span><br/>';

	connectClient();
}

function onSuccess() {
	console.log("Connection successful");
	client.subscribe("hy5t13ak/chat/"+UUID);
	var message = new Paho.MQTT.Message('{"ID":"'+UUID+'", "status":"queuecheck"}');
	message.destinationName = "hy5t13ak/chat/"+UUID;
	client.send(message);
}

function onFailure(e) {
	console.log("Error: " + e.errorCode + "\nreconnecting in 3 seconds...");
	setTimeout(function() {
		if (typeof onFailure.counter == 'undefined') {
			onFailure.counter = 0;
		}
		onFailure.counter++;
		if (onFailure.counter <= 5) {
			connectClient();
		}
		else {
			var body = document.getElementById("mqttchatbody");
			body.innerHTML += '<span class="mqttchatmessage">It looks like you\'re having trouble reconnecting to our chat network. Please refresh your browser and check your network connection.</span><br/>';
		}
	}, 3000);
}

function publishMessage(payload) {
	var message = new Paho.MQTT.Message('{"text":"'+payload+'","ID":"'+UUID+'", "sender":"user"}');
	message.destinationName = "hy5t13ak/chat/"+UUID;
	client.send(message);
}

function disconnectClient() {
	client.disconnect();
}

//maybe not universal...
function generateUUID() {
	var d = new Date().getTime();
	UUID = "xxxxxxxx".replace(/[x]/g, function() {
		var r = (d + Math.random() * 16) % 16 | 0;
		return r.toString(16);
	});
}

function toggleChat() {
	if (!client) {
		listenOnInput();
	}
	var mtnTime = new Date().getUTCHours() - 6;
	console.log("mountain time: " + mtnTime);
	//if working hours during mountain time, start chat
	//otherwise make a zendesk ticket
	if (mtnTime >= 8 && mtnTime <= 17) {
		var chat = document.getElementById("mqttchatwindow");
		var preview = document.getElementById("mqttchatpreview");
		if (preview.style.display != "none") {
			chat.style.display = "initial";
			preview.style.display = "none";
		}
		else {
			chat.style.display = "none";
			preview.style.display = "initial";		
		}
	}
	else {
		var email = document.getElementById("mqttchatemail");
		var preview = document.getElementById("mqttchatpreview");
		email.style.display = "initial";
		preview.style.display = "none";

		var form = document.getElementById("mqttemailform");
		if (form.addEventListener) { //browsers
			form.addEventListener("submit", makeRequest, true); 
		}
		else if (form.attachEvent) { //IE is bad
			form.attachEvent('onsubmit', makeRequest);
		}
	}
}

function makeRequest(e) {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (req.readyState == XMLHttpRequest.DONE) {
			console.log(req.responseText);
			document.getElementById("mqttchatemail").innerHTML = '<h4>Thanks! An email has been sent to the team. We\'ll get back to you soon.</h4><button onclick="toggleChat();">Close</button>';
		}
	}

	var email = document.getElementById("mqttchatemailinput");
	var name = document.getElementById("mqttchatemailname");
	var subject = document.getElementById("mqttchatemailsubject");
	var message = document.getElementById("mqttchatemailtextarea");
	req.open("POST", "http://mqtt-slack.herokuapp.com/email", true);
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	req.send("email=" + email.value + "&message=" + message.value + "&subject=" + subject.value + "&name=" + name.value);
	e.preventDefault();
}

return {
	start: function(credentials) {
		document.getElementsByTagName("head")[0].innerHTML += '<style>'+
		'*[id^="mqttchat"] {'+
		'-webkit-box-sizing: border-box;'+
		'-moz-box-sizing: border-box;'+
		'box-sizing: border-box;'+	
		'font-family: "whitney-book", Helvetica, Arial, sans-serif;'+
		'}'+
		'#mqttchatwindow {'+
		'position: absolute;'+
		'bottom: 0;'+
		'right: 100px;'+
		'height: 300px;'+
		'width: 250px;'+
		'border: 1px solid;'+
		'border-color: #ddd;'+
		'padding: 0;'+
		'display: none;'+
		'}'+
		'#mqttchatheader {'+
		'background: #566872;'+
		'width: 100%;'+
		'height: 10%;'+
		'margin: 0;'+
		'padding: 6px;'+
		'color: #fff;'+
		'}'+
		'#mqttchatheader > span {'+
		'display: block;'+
		'font-size: 14px;'+
		'}'+
		'#mqttchatbody {'+
		'width: 100%;'+
		'height: 78%;'+
		'padding: 6px;'+
		'margin: 0;'+
		'border-bottom: 1px solid;'+
		'border-color: #ddd;'+
		'color: #566872;'+
		'overflow: scroll;'+
		'word-wrap: break-word;'+
		'}'+
		'.mqttchatmessage {'+
		'font-size: 12px;'+
		'}'+
		'#mqttchatinput {'+
		'outline: none;'+
		'resize: none;'+
		'margin: 0;'+
		'padding: 1px;'+
		'width: 100%;'+
		'height: 100%;'+
		'border: 1px solid #ddd;'+
		'}'+
		'#mqttchatinput:focus {'+
		'-webkit-box-shadow: inset 0 0 2px rgba(41, 163, 210, 1);'+
		'-moz-box-shadow: inset 0 0 2px rgba(41, 163, 210, 1);'+
		'box-shadow: inset 0 0 2px rgba(41, 163, 210, 1);'+
		'}'+
		'#mqttchatfooter {'+
		'height: 12%;'+
		'width: 100%;'+
		'padding: 3px;'+
		'}'+
		'#mqttchatpreview {'+
		'position: absolute;'+
		'bottom: 0;'+
		'right: 100px;'+
		'width: 175px;'+
		'height: 30px;'+
		'padding: 4px;'+
		'background: #566872;'+
		'text-align: center;'+
		'}'+
		'#mqttchatpreview > span {'+
		'color: #eee;'+
		'font-size: 12px;'+
		'}'+
		'#mqttchatemail {'+
		'display: none;'+
		'position: absolute;'+
		'bottom: 0;'+
		'right: 100px;'+
		'width: 250px;'+
		'height: 375px;'+
		'border: 1px solid;'+
		'border-color: #566872;'+
		'background: #CFD4D9;'+
		'padding: 0px;'+
		'}'+
		'#mqttchatemailbody {'+
		'padding: 10px;'+
		'text-align: center;'+
		'width: 100%;'+
		'}'+
		'#mqttchatemailbody h4 {'+
		'margin: 0;'+
		'color: rgb(51, 51, 51);'+
		'}'+
		'#mqttchatemailbody * {'+
		'margin-bottom: 5px;'+
		'width: 100%;'+
		'border-radius: 2px;'+
		'border: #ddd;'+
		'}'+
		'#mqttchatemailbutton {'+
		'margin: 0 auto;'+
		'width: 50%;'+
		'color: #fff;'+
		'background-color: rgb(66, 139, 202);'+
		'}'+
		'#mqttchatemailbutton:hover {'+
		'background-color: #316897;'+
		'}</style>';
		document.getElementsByTagName("body")[0].innerHTML += '<div id="mqttchatwindow">'+
		'<div id="mqttchatheader">'+
		'<span>Now chatting...</span>'+
		'</div>'+
		'<div id="mqttchatbody">'+
		'</div>'+
		'<div id="mqttchatfooter">'+
		'<textarea id="mqttchatinput"></textarea>'+
		'</div>'+
		'</div>'+
		'<div id="mqttchatpreview">'+
		'<span>Chat with our support staff!</span>'+
		'</div>'+
		'<div id="mqttchatemail">'+
		'<div id="mqttchatheader">'+
		'<span>Chat</span>'+
		'</div>'+
		'<div id="mqttchatemailbody">'+
		'<form id="mqttemailform" method="post">'+
		'<h4>Our staff is busy sleeping! Send us an email and we\'ll get back to you as soon as the sun comes up.</h4>'+
		'<input id="mqttchatemailinput" value="Your Email" cols="25" onfocus="if(this.value == \'Your Email\') { this.value = \'\'; }"><br/>'+
		'<input id="mqttchatemailname" value="Your Name" cols="25" onfocus="if(this.value == \'Your Name\') { this.value = \'\'; }"><br/>'+
		'<input id="mqttchatemailsubject" value="Subject" cols="25" onfocus="if(this.value == \'Subject\') { this.value = \'\'; }"><br/>'+
		'<textarea id="mqttchatemailtextarea" name="message" rows="10" onfocus="if(this.value == \'Message\') { this.value = \'\'; }">Message</textarea>'+
		'<button id="mqttchatemailbutton">Submit</button>'+
		'</form>'+
		'</div>'+
		'</div>';

		document.getElementById("mqttchatpreview").onclick = toggleChat;
		document.getElementById("mqttchatheader").onclick = toggleChat;
		mqttUsername = credentials.username;
		mqttPassword = credentials.password;
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.src = "http://git.eclipse.org/c/paho/org.eclipse.paho.mqtt.javascript.git/plain/src/mqttws31.js";
		script.type = "text/javascript";
		console.log("grabbing Paho MQTT client");
		script.onload = loadMD5;
		head.appendChild(script);
	}
}

})();
