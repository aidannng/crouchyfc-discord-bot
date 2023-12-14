const { Events, EmbedBuilder } = require('discord.js');
const { LOGS_CHANNEL } = require('../config.json');

module.exports = {
	name: Events.MessageDelete,
	execute(message) {
        if(message.author.bot) return; // ignore bots

        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`Message Deleted`)
        .setDescription(`
            **User:** <@${message.author.id}>
            **Message:** ${message.content}
            **Channel:** <#${message.channel.id}>
            `
        )
        .setTimestamp()
        .setFooter({ text: `${message.guild.name}`, iconURL: `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}` });

        message.guild.channels.cache.get(LOGS_CHANNEL).send({ content: ``, embeds: [embed] })

	},
};