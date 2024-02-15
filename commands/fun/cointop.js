const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
        .setName('cointop')
        .setDescription('View the top 10 users with the most coins.'),
    async execute(interaction) {
        try {
            // Fetch the top 10 users with the most coins from the database
            const [rows] = await pool.execute('SELECT id, coins FROM users ORDER BY coins DESC LIMIT 10');

            // Format the data into an embedded message
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Top 10 Users with the Most Coins')
                .setDescription(rows.map((row, index) => `**${index + 1}.** <@${row.id}> - ${row.coins.toLocaleString()} coins`).join('\n'));

            // Send the embedded message
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing cointop command:', error);
            await interaction.reply('An error occurred while processing your command.');
        }
    },
};
