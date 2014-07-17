var md5 = require('MD5');

module.exports = {
	mqtt: {
		host: 'q.thingfabric.com',
		port: 1883,
		topic: '',
		options: {
			clientID: '',
			username: '',
			password: md5(''),
			keepalive: 30
		}
	},
	slack: {
		port: Number(process.env.PORT || 5000),
		host: '*.slack.com',
		incomingToken: '',
		outgoingToken: ''
	},
	zendesk: {
		email: '',
		token: '',
		host: '*.zendesk.com',

	},
	activeUserLimit: 10
};