# Live Browser Chat With Slack Integration

Browser-based chat client that sends messages to and from Slack. A NodeJS webserver acts as a middleman between Slack and MQTT (using [2lemetry's ThingFabric] [1]), and the chat client sends messages to it via MQTT. Also includes automated Zendesk ticket creation for after-hours users.

## Setup
* Create and Outgoing and Incoming Webhook in Slack. Outgoing should point to the webserver you'll be setting up shortly. 
* Fill out config.js with your MQTT, Slack, and Zendesk credentials.
* Drop the files onto a webserver (better organization forthcoming)
* Start #synergizing your #brand



[1]:http://app.thingfabric.com