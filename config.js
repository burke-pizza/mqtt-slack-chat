var md5 = require('MD5');

module.exports = {
	mqtt: {
		host: 'q.thingfabric.com',
		port: 1883,
		topic: 'hy5t13ak/chat',
		options: {
			clientID: '2lemetryslackmqtt',
			username: '0s1nuck2oc',
			password: md5('l427ftfj77il'),
			keepalive: 30
		}
	},
	slack: {
		port: Number(process.env.PORT || 5000),
		host: '2lemetry.slack.com',
		incomingToken: 'slVNeAu8bRa4wMWrow1dCZqW',
		outgoingToken: 'OMGFkQjInzjYau773VZyb8Pd'
	},
	zendesk: {
		email: 'support_agents@2lemetry.com',
		token: 'JE0q7VaxAXFyPBHJ70Pa5g1GafGRaHXPZlHvzTld',
		host: '2lemetry.zendesk.com',

	},
	activeUserLimit: 2
};