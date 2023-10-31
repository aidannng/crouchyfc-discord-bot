const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { guildId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you want to get information about')
                .setRequired(true)
        )
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setDescription(`
			**Username:** ${user.username} (<@${user.id}>)
			**ID:** ${user.id}
			**Created Account:** ${user.createdAt}
			**Bot:** ${user.bot}`
		)

		.setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.jpg`)
		.setTimestamp()
		.setFooter({ text: `${interaction.guild.name}`, iconURL: `https://cdn.discordapp.com/icons/${guildId}/${interaction.guild.icon}` });
		
		await interaction.reply({ content: '', embeds: [embed] });
	},
};