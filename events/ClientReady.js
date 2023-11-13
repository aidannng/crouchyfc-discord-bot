const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GENERAL_CHAT, TICKETS_CHANNEL, BOT_COMMANDS_CHAT } = require('../config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		// NOTIFICATIONS
		console.log(`Ready! Logged in as ${client.user.tag}`);
        client.channels.cache.get(GENERAL_CHAT).send(`hello world`)

		// TICKETS EMBED
		/* client.channels.cache.get(TICKETS_CHANNEL).bulkDelete(1)

		const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`Support Tickets`)
		.setDescription(`If you need support, feel free to open a ticket and a moderator will be with you shortly. You can only have one ticket open at a time.`)		

        const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('ticket_support')
				.setLabel('General Support')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('🎫')
		)
		.addComponents(
			new ButtonBuilder()
				.setCustomId('ticket_twitch')
				.setLabel('Twitch Related Support')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('👾')
		)
		.addComponents(
			new ButtonBuilder()
				.setCustomId('ticket_highlights')
				.setLabel('Submit Highlights')
				.setStyle(ButtonStyle.Success)
				.setEmoji('📸')
		);

		client.channels.cache.get(TICKETS_CHANNEL).send({embeds: [embed], components: [row]}) */
	},
};