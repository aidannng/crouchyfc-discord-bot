const { Events, EmbedBuilder } = require('discord.js');
const { db_host, db_user, db_password, db_database, LOGS_CHANNEL, BLOCK_USER_PINGS, MOD_ROLE, MANAGEMENT_ROLE } = require('../config.json');
const mysql = require('mysql2');
const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database
});

// Function to calculate XP based on message length
function calculateXP(message) {
    // Define XP parameters (adjust as needed)
    const minXP = 1; // Minimum XP awarded
    const maxXP = 25; // Maximum XP awarded
    const maxLength = 500; // Maximum message length to award max XP

    // Calculate XP based on message length
    const messageLength = Math.min(message.content.length, maxLength);
    const xp = minXP + Math.floor((maxXP - minXP) * (messageLength / maxLength));
    return xp;
}

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        if(message.author.bot) return; // ignore bots

        // ANTI ADVERTISEMENT SYSTEM
        if(message.content.includes('discord.gg')){
            if(!message.member.roles.cache.has(MANAGEMENT_ROLE) || !message.member.roles.cache.has(MOD_ROLE)){
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
                if(message.mentions.members.has(userId) && !message.member.roles.cache.has(MOD_ROLE) && !message.member.roles.cache.has(MANAGEMENT_ROLE)) {
                    message.delete();
                    message.channel.send(`<@${message.author.id}>, do not ping this user.`);
                }
            });
        }

        // ADD XP
        const xp = calculateXP(message);
        pool.query('UPDATE users SET xp = xp + ? WHERE id = ?', [xp, message.author.id], (error, results) => {
            if (error) {
                console.error('Error updating user XP in database:', error);
            }
        });

        pool.query('INSERT INTO messages (user,channel,xp,message,time) VALUES (?,?,?,?,?)', [message.author.id, message.channel.id, xp, message.content, Date.now()], (error, results) => {
            if (error) {
                console.error('Error inserting message into database:', error);
            }
        });
        
    },
};
