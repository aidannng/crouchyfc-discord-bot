const { Events } = require('discord.js');
const { GENERAL_CHAT } = require('../config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
        client.channels.cache.get(GENERAL_CHAT).send(`hello world`)
	},
};