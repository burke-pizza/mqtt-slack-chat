# Live Browser Chat With Slack Integration

Browser-based chat client that sends messages to and from Slack. A NodeJS webserver acts as a middleman between Slack and MQTT (using [2lemetry's ThingFabric] [1]), and the chat client sends messages to it via MQTT. Also includes automated Zendesk ticket creation for after-hours users.

## Setup
```html
<script type="text/javascript" charset="utf-8" src="path/to/mqttchat.js"></script>
<script>
	chatPlugin.start({
		username: '[ThingFabric username]',
		password: '[ThingFabric token]'
	});
</script>
```
* Drop the above into your webpage
* Create and Outgoing and Incoming Webhook in Slack. Outgoing should point to the webserver you'll be setting up shortly. 
* Fill out config.js with your MQTT, Slack, and Zendesk credentials.
* Host Node app on platform of your choosing
* Start #synergizing your #brand



[1]:http://app.thingfabric.com