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
        .setName('messagetop')
        .setDescription('View the Top 10 users with the most messages sent.'),
    async execute(interaction) {
        try {
            const [rows] = await pool.execute('SELECT u.id, IFNULL(m.message_count, 0) AS message_count FROM users u LEFT JOIN (SELECT user, COUNT(*) AS message_count FROM messages GROUP BY user) m ON u.id = m.user ORDER BY message_count DESC LIMIT 10');

            const topUsers = rows.map((row, index) => `**${index + 1}.** <@${row.id}> - **${row.message_count.toLocaleString()}** Messages Sent`);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Top 10 Users with the Most Messages')
                .setDescription(topUsers.join('\n'));
            await interaction.reply({  embeds: [embed] });
        } catch (error) {
            console.error('Error executing /messagetop command:', error);
            await interaction.reply('An error occurred while processing your command.');
        }
    },
};
