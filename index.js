var mqtt = require('mqtt');

var config = require('./config');
var slack = require('./slack');


var client;

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
		//if mqtt message is from a user, send it to slack
		if (mjson.sender == 'user') {
			slack.postToSlack(mjson);
		}

}