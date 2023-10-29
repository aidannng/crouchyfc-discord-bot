const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { guildId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		var created = interaction.guild.createdTimestamp / 1000
		created = Math.round(created)
		const embed = new EmbedBuilder()

		.setColor(0x0099FF)
		.setTitle(`${interaction.guild.name}`)
		.setURL('https://www.twitch.tv/thepeoplespunditlive')
		.setDescription(`
			**Discord Owner:** <@${interaction.guild.ownerId}>
			**Member Count:** ${interaction.guild.memberCount}
			**Server Created:** <t:${created}> (<t:${created}:R>)
		`)		
		.setThumbnail(`https://cdn.discordapp.com/icons/${guildId}/${interaction.guild.icon}`)
		
		.setTimestamp()
		.setFooter({ text: `${interaction.guild.name}`, iconURL: `https://cdn.discordapp.com/icons/${guildId}/${interaction.guild.icon}` });

		await interaction.reply({ embeds: [embed] });
	},
};