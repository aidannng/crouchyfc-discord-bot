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
        .setName('cf')
        .setDescription('Create a coin flip')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('The amount of coins you want to put on a coin flip')
                .setRequired(true)
                .setMinValue(1)
        )
        .addStringOption(option =>
            option.setName('side')
                .setDescription('Which side of the coin do you want to bet on?')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                )
        ),
    async execute(interaction) {
        const userId = interaction.user.id;
        const amount = interaction.options.getInteger('amount');
        const side = interaction.options.getString('side');

        try {
            // Check if the user already has an active coin flip
            const [activeCoinFlips] = await pool.execute('SELECT COUNT(*) AS count FROM coin_flips WHERE created = ? AND winner = ?', [userId, 0]);
            if (activeCoinFlips[0].count > 0) {
                return await interaction.reply('You already have an active coin flip.');
            }

            // Check if the user has enough coins to create a coin flip
            const [userCoins] = await pool.execute('SELECT coins FROM users WHERE id = ?', [userId]);
            const userCoinsAmount = userCoins[0].coins;
            if (userCoinsAmount < amount) {
                return await interaction.reply('You don\'t have enough coins to create that coin flip.');
            }

            // Create a new coin flip
            await pool.execute('UPDATE users SET coins = coins - ? WHERE id = ?', [amount, userId]);
            await pool.execute('INSERT INTO coin_flips (created, side, amount, time) VALUES (?, ?, ?, ?)', [userId, side, amount, new Date() / 1000]);

            const embed = {
                color: 0x0099ff,
                title: 'Coin Flip Created',
                description: `You have created a Coin Flip for **${amount} coins** and betting on **${side}**!\nPeople can use the **\`/challenge\`** command to challenge you to a coin flip`,
            };

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error creating coin flip:', error);
            await interaction.reply('An error occurred while processing your command.');
        }
    },
};
