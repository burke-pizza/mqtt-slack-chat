var mqtt = require('mqtt');

var config = require('./config');

module.exports = {
	connectMQTT: function(client) {

	},

	publishToMQTT: function(message) {
		client.publish(config.mqtt.topic, message);
	},
};

var handleMessage = function(message) {

}