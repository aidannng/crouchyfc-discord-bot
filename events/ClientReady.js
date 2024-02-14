const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GENERAL_CHAT, TICKETS_CHANNEL, BOT_COMMANDS_CHAT } = require('../config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		// NOTIFICATIONS
		console.log(`Ready! Logged in as ${client.user.tag}`);
        client.channels.cache.get(GENERAL_CHAT).send(`hello world`)
	},
};