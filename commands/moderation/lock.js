const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MOD_ROLE } = require('../../config.json');

module.exports = {
	data: 
    new SlashCommandBuilder()
		.setName('lock')
		.setDescription('Lock/Unlock a channel! (Moderator)'),
	async execute(interaction) {
        if(interaction.member.roles.cache.has(MOD_ROLE)){

            if(interaction.channel.permissionsFor(interaction.guild.roles.everyone).has('SendMessages')){
                userid = interaction.user.id;
                interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
                await interaction.reply({ content: `<@${userid}> Locked <#${interaction.channel.id}> ` });
            } else {
                interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
                await interaction.reply({ content: `<@${userid}> Unlocked <#${interaction.channel.id}> ` });
            }
        } else {
            await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
	},
};