var mqtt = require('mqtt');

var config = require('./config');
var slack = require('./slack');


var client;
var activeUsers = [];
var queuedUsers = [];

client = mqtt.createClient(config.mqtt.port, config.mqtt.host, config.mqtt.options);
client.subscribe(config.mqtt.topic+'/#', function(e, g) {
	slack.startServer(client);
});

client.on('message', function(topic, message) {
	handleMessage(message);
});

function handleMessage(message) {
	console.log(message);
	var mjson = JSON.parse(message);
	//catching disconnect messages
	if (typeof mjson.error != 'undefined') {
		if (activeUsers.indexOf(mjson.ID) > -1) {
			var index = activeUsers.indexOf(mjson.ID);
			activeUsers.splice(index, 1);
			if (queuedUsers.length > 0) {
				moveIntoActive();
			}
		}
	}
	//check message ID against active users list
	if (mjson.sender == 'user') {
		console.log(activeUsers);
		console.log(activeUsers.length + ' ' + config.queueLength);
		if (queuedUsers.indexOf(mjson.ID) > -1) {
			var position = queuedUsers.indexOf(ID) + 1;
			var message = '{"sender":"2lemetry","text":"We\'ll get back to you as soon as possible!'+
			'Your position in line: '+position+'"}'
			client.publish(config.mqtt.topic+'/'+ID, message);
		}
		else if (activeUsers.indexOf(mjson.ID) > -1) {
			console.log("active user");
			slack.postToSlack(mjson);
		}
		else if (activeUsers.indexOf(mjson.ID) == -1 && activeUsers.length < config.activeUserLimit) {
			console.log("new user");
			if (activeUsers[0] == undefined) {
				activeUsers[0] = mjson.ID;
			}
			else {
				activeUsers.push(mjson.ID);
			}
			slack.postToSlack(mjson);
		}
		else if (activeUsers.indexOf(mjson.ID) == -1 && activeUsers.length >= config.activeUserLimit) {
			console.log("queue user");
			placeInQueue(mjson.ID);
		}
	}
}

function placeInQueue(ID) {
	queuedUsers.push(ID);
	var position = queuedUsers.indexOf(ID) + 1;
	var message = '{"sender":"2lemetry","text":"All of our support staff are currently busy saving the day.'+
				'We\'ve put you in a queue and will help you as soon as possible.'+ 
				'Your position in line is: '+position+'"}';
	client.publish(config.mqtt.topic+'/'+ID, message);
}

function moveIntoActive() {
	var ID = queuedUsers[0];
	activeUsers.push(queuedUsers.shift());
	var message = '{"sender":"2lemetry", "text":"All set! How can we help?"}'
	client.publish(config.mqtt.topic+'/'+ID, message);
}