const { SlashCommandBuilder } = require('discord.js');
const { db_host, db_user, db_password, db_database } = require('../../config.json');
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
                    await pool.execute('INSERT INTO daily_rewards (user, time) VALUES (?, ?)', [userId, Date.now() / 1000]);
                    await pool.execute('UPDATE users SET coins = coins + 500, xp = xp + 100 WHERE id = ?', [userId]);
                    await pool.execute('INSERT INTO coins_statements (user, amount, type, description, time) VALUES (?, ?, ?, ?, ?)', [userId, 500, "increase", "Daily Reward", Date.now()]);

                    await interaction.reply('You have claimed your daily reward! You have been given **500 coins** and **100xp**');
                }
            } else {
                await pool.execute('INSERT INTO daily_rewards (user, time) VALUES (?, ?)', [userId, Date.now() / 1000]);
                await pool.execute('UPDATE users SET coins = coins + 1500, xp = xp + 500 WHERE id = ?', [userId]);
                await pool.execute('INSERT INTO coins_statements (user, amount, type, description, time) VALUES (?, ?, ?, ?, ?)', [userId, 1500, "increase", "Daily Reward", Date.now()]);

                await interaction.reply('You have claimed your **FIRST** daily reward! You have been given **1,500 coins** and **500xp**');
            }
        } catch (error) {
            console.error('Error executing daily command:', error);
            await interaction.reply('An error occurred while processing your command.');
        }
    },
};
