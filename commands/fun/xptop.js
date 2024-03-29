const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db_host, db_user, db_password, db_database } = require('../../config.json');
const { getLevel } = require('../../functions');
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
            const [rows] = await pool.execute('SELECT u.id, u.xp, (SELECT COUNT(*) FROM messages m WHERE m.user = u.id) AS message_count FROM users u ORDER BY u.xp DESC LIMIT 10');

            const topUsers = rows.map((row, index) => `**${index + 1}.** <@${row.id}> - ${row.xp.toLocaleString()} Xp (Level ${getLevel(row.xp)})`);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Top 10 Users with the Most Xp')
                .setDescription(topUsers.join('\n'));
            await interaction.reply({  embeds: [embed] });
        } catch (error) {
            console.error('Error executing /xptop command:', error);
            await interaction.reply('An error occurred while processing your command.');
        }
    },
};
