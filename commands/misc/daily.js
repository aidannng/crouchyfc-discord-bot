const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MOD_ROLE, COMMUNITY_VIP_ROLE, NITRO_ROLE, TWITCH_SUB_ROLE, db_host, db_user, db_password, db_database } = require('../../config.json');
const mysql = require('mysql2/promise'); // Import the promise-based version of mysql

const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward! (24 hour cooldown)'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            const [rows] = await pool.execute('SELECT `time` FROM `daily_rewards` WHERE `user` = ? ORDER BY time DESC LIMIT 1', [userId]);

            if (rows.length > 0) {
                const lastClaimed = rows[0].time;

                if (Date.now() / 1000 - lastClaimed < 86400) {
                    const remainingTime = Math.ceil(86400 - (Date.now() / 1000 - lastClaimed));
                    const hours = Math.floor(remainingTime / 3600);
                    const minutes = Math.floor((remainingTime % 3600) / 60);

                    await interaction.reply(`You must wait **${hours} hours** and **${minutes} minutes** until you can claim your daily reward.`);
                } else {
                    let coins = 500
                    let xp = 100

                    const member = await interaction.guild.members.fetch(userId);
                    const roles = member.roles.cache;
                    let rewardMessage = `You have claimed your **/daily** reward! You have been given **500 coins** and **100xp**`;

                    if(roles.has(MOD_ROLE)) {
                        rewardMessage += `\nYou have got an additonal **3,000 coins** and **200xp** for being a <@&${MOD_ROLE}>!`;
                        coins += 3000
                        xp += 200
                    }

                    if (roles.has(COMMUNITY_VIP_ROLE)) {
                        rewardMessage += `\nYou have got an additonal **2,000 coins** and **250xp** for being a <@&${COMMUNITY_VIP_ROLE}>!`;
                        coins += 2000
                        xp += 250
                    }

                    if (roles.has(NITRO_ROLE)) {
                        rewardMessage += `\nYou have got an additonal **1,000 coins** and **125xp** for being a <@&${NITRO_ROLE}>!`;
                        coins += 1000
                        xp += 125
                    }

                    if (roles.has(TWITCH_SUB_ROLE)) {
                        rewardMessage += `\nYou have got an additonal **1,500 coins** and **150xp** for being a <@&${TWITCH_SUB_ROLE}>!`;
                        coins += 1500
                        xp += 150
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setDescription(` ${rewardMessage}`);

                    await pool.execute('INSERT INTO daily_rewards (user, time) VALUES (?, ?)', [userId, Date.now() / 1000]);
                    await pool.execute('UPDATE users SET coins = coins + ?, xp = xp + ? WHERE id = ?', [coins, xp, userId]);
                    await pool.execute('INSERT INTO coins_statements (user, amount, type, description, time) VALUES (?, ?, ?, ?, ?)', [userId, coins, "increase", "Daily Reward", Date.now() / 1000]);

                    await interaction.reply({ embeds: [embed] });
                }
            } else {
                await pool.execute('INSERT INTO daily_rewards (user, time) VALUES (?, ?)', [userId, Date.now() / 1000]);
                await pool.execute('UPDATE users SET coins = coins + 1500, xp = xp + 500 WHERE id = ?', [userId]);
                await pool.execute('INSERT INTO coins_statements (user, amount, type, description, time) VALUES (?, ?, ?, ?, ?)', [userId, 1500, "increase", "Daily Reward", Date.now() / 1000]);

                await interaction.reply('You have claimed your **FIRST** daily reward! You have been given **1,500 coins** and **500xp**');
            }
        } catch (error) {
            console.error('Error executing daily command:', error);
            await interaction.reply('An error occurred while processing your command.');
        }
    },
};
