const { Events, EmbedBuilder } = require('discord.js');
const { db_host, db_user, db_password, db_database, LOGS_CHANNEL, BLOCK_USER_PINGS, MOD_ROLE, ADMIN_ROLE, DEVELOPER_USER_ID, TICKETS_CHANNEL } = require('../config.json');
/* const mysql = require('mysql2');
const connection = mysql.createConnection({
	host: db_host,
	user: db_user,
	password: db_password,
	database: db_database,
	port: 3306
}); */

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
        if(message.author.bot) return; // ignore bots

        // STORE TICKET MESSAGES
        /* connection.execute('SELECT id, user_id, transcript_id, channel_id, time, first_reply FROM tickets WHERE channel_id = ?',[message.channel.id],function(err, result, fields) {
            if(result[0]){
                
                if(result[0].first_reply === 0){
                    if(message.member.roles.cache.has(MOD_ROLE) || message.member.roles.cache.has(TWITCH_MOD_ROLE)){
                        connection.execute('UPDATE `tickets` SET `first_reply` = ? WHERE `tickets`.`id` = ?',[Date.now(), result[0].id],function(err, result, fields) {});
                    }
                }

                connection.execute('INSERT INTO `ticket_messages` (`ticket_id`, `author_id`, `message`, `time`) VALUES (?, ?, ?, ?)',[result[0].id, message.author.id, message.content, Date.now()],function(err, result, fields) {});
            }
        }); */

        // ANTI ADVERTISEMENT SYSTEM
        if(message.content.includes('discord.gg')){
            if(!message.member.roles.cache.has(ADMIN_ROLE) || !message.member.roles.cache.has(MOD_ROLE)){
                message.delete();
                message.channel.send(`<@${message.author.id}>, do not send Discord invites in this server`)

                const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Discord Invite Deleted`)
                .setDescription(`
                    **User:** <@${message.author.id}>
                    **Message:** ${message.content}
                    **Channel:** <#${message.channel.id}>
                    **Time:** <t:${Math.round(+new Date()/1000)}>
                    `
                )
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}` });
                message.guild.channels.cache.get(LOGS_CHANNEL).send({ content: `<@${message.author.id}> sent a Discord Invite`, embeds: [embed] })
            }
        }

        // ANTI TAG SYSTEM
        if(message.mentions.members.size) {
            BLOCK_USER_PINGS.forEach(userId => {
                if(message.mentions.members.has(userId) && !message.member.roles.cache.has(MOD_ROLE) && !message.member.roles.cache.has(ADMIN_ROLE)) {
                    message.delete();
                    message.channel.send(`<@${message.author.id}>, do not ping this user.`);

                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Anti Tag System`)
                    .setDescription(`
                        **User:** <@${message.author.id}>
                        **Message:** ${message.content}
                        **Channel:** <#${message.channel.id}>
                        **Time:** <t:${Math.round(+new Date()/1000)}>
                        `
                    )
                    .setTimestamp()
                    .setFooter({ text: `${message.guild.name}`, iconURL: `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}` });
                    message.guild.channels.cache.get(LOGS_CHANNEL).send({ content: ``, embeds: [embed] })
                }
            });
        }

	},
};