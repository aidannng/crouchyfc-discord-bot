const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db_host, db_user, db_password, db_database } = require('../../config.json');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xptop')
        .setDescription('View the Top 10 users with the most Xp.'),
    async execute(interaction) {
        try {
            // Fetch the top 10 users with the most coins from the database
            const [rows] = await pool.execute('SELECT u.id, u.xp, COUNT(m.id) AS message_count FROM users u LEFT JOIN messages m ON u.id = m.user GROUP BY u.id ORDER BY u.xp DESC LIMIT 10');

            // Format the data into an array of strings
            const topUsers = rows.map((row, index) => `**${index + 1}.** <@${row.id}> - ${row.xp.toLocaleString()} Xp (${row.message_count.toLocaleString()} Messages Sent)`);

            // Create an embedded message
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Top 10 Users with the Most Xp')
                .setDescription(topUsers.join('\n'));

            // Send the embedded message
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing /xptop command:', error);
            await interaction.reply('An error occurred while processing your command.');
        }
    },
};
