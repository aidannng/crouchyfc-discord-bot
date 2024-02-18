const { Events, EmbedBuilder } = require('discord.js');
const { db_host, db_user, db_password, db_database, LOGS_CHANNEL, BLOCK_USER_PINGS, MOD_ROLE, MANAGEMENT_ROLE } = require('../config.json');
const { getLevel, getLevelUpCoins } = require('../functions');
const mysql = require('mysql2/promise'); // Import the promise-based version of mysql
const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database
});

function calculateXP(message) {
    const minXP = 1; 
    const maxXP = 25;
    const maxLength = 500;

    const messageLength = Math.min(message.content.length, maxLength);
    const xp = minXP + Math.floor((maxXP - minXP) * (messageLength / maxLength));
    return xp;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
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

        // XP / LEVEL SYSTEM
        try {
            const [rows] = await pool.execute('SELECT xp FROM users WHERE id = ?', [message.author.id]);
            const oldXp = rows[0]?.xp || 0;

            const xp = calculateXP(message);
            await pool.execute('UPDATE users SET xp = xp + ? WHERE id = ?', [xp, message.author.id]);
            await pool.execute('INSERT INTO messages (user,channel,xp,message,time) VALUES (?,?,?,?,?)', [message.author.id, message.channel.id, xp, message.content, Date.now() / 1000]);

            const newxp = oldXp + xp;
            const oldLevel = getLevel(oldXp);
            const newLevel = getLevel(newxp);

            if (newLevel > oldLevel) {
                const rewardCoins = getLevelUpCoins(newLevel)
                const embed = new EmbedBuilder()
                .setColor('#F8D664')
                .setDescription(`<@${message.author.id}> has leveled up to **Level ${newLevel}** and been given **${rewardCoins}** coins!`);
            
                await message.reply({ embeds: [embed] });
                await pool.execute('UPDATE users SET coins = coins + ? WHERE id = ?', [rewardCoins, message.author.id]);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    },
};
