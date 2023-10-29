const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { guildId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong and boring information!'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setDescription(`**Bot Latency:** ${Date.now() - interaction.createdTimestamp}ms\n**API Latency:** ${Math.round(interaction.client.ws.ping)}ms`)
		
		.setTimestamp()
		.setFooter({ text: `${interaction.guild.name}`, iconURL: `https://cdn.discordapp.com/icons/${guildId}/${interaction.guild.icon}` });

		await interaction.reply({ content: 'Pong!', embeds: [embed] });
	},
};