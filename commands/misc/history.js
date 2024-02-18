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
        .setName('history')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('View the user\'s game history')
                .setRequired(false)
        )
        .setDescription('View a user\'s game history'),
    async execute(interaction) {
        const userOption = interaction.options.getUser('user');
        const userId = userOption ? userOption.id : interaction.user.id;

        try {
            const [rows] = await pool.execute('SELECT * FROM coin_flips WHERE created = ? OR challenger = ?', [userId, userId]);

            if (rows.length > 0) {
                const totalGames = rows.length;
                const wins = rows.filter(row => row.winner === userId).length;
                const losses = totalGames - wins;
                const winPercentage = ((wins / totalGames) * 100).toFixed(2);

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`<@${userId}> has played a total of **${totalGames}** games, with **${wins}** wins and **${losses}** losses.\nWin percentage: **${winPercentage}%**`);

                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply('No game history found for the specified user.');
            }
        } catch (error) {
            console.error('Error executing /history command:', error);
            await interaction.reply('An error occurred while fetching game history.');
        }
    },
};
