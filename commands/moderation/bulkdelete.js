const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MOD_ROLE } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bulkdelete')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('The amount of messages you want to delete')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
		.setDescription('Delete a large amount of messages!'),
	async execute(interaction) {
        if(interaction.member.roles.cache.has(MOD_ROLE)){
            interaction.channel.bulkDelete(interaction.options.getInteger('amount'));
            await interaction.reply({ content: `Deleted ${interaction.options.getInteger('amount')} Messages` });
        } else {
            await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
	},
};