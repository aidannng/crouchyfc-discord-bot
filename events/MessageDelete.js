const { Events, EmbedBuilder } = require('discord.js');
const { db_host, db_user, db_password, db_database, LOGS_CHANNEL } = require('../config.json');
/* const mysql = require('mysql2');
const connection = mysql.createConnection({
	host: db_host,
	user: db_user,
	password: db_password,
	database: db_database,
	port: 3306
}); */

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

        message.guild.channels.cache.get(LOGS_CHANNEL).send({ content: `<@${message.author.id}> Deleted a message`, embeds: [embed] })

	},
};