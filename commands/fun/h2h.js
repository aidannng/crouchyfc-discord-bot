const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { guildId, db_host, db_user, db_password, db_database } = require('../../config.json');
const mysql = require('mysql2/promise'); // Import the promise-based version of mysql

const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('h2h')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('First user to compare with.')
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName('user2')
                .setDescription('Second user to compare with.')
                .setRequired(true)
        )
        .setDescription('View the record between 2 users.'),
    async execute(interaction) {
        const userid = interaction.options.getUser('user').id;
        const userid2 = interaction.options.getUser('user2').id;

        if(userid === userid2) {
            const embed = new EmbedBuilder()
                .setDescription(`You cannot compare match history between the same user.`)
                .setColor('#ff0000');

            interaction.reply({ embeds: [embed] });
            return;
        }

        const [rows] = await pool.query('SELECT * FROM coin_flips WHERE (challenger = ? AND created = ?) OR (challenger = ? AND created = ?)', [userid, userid2, userid2, userid]);
        
        const toalGames = rows.length;

        if(toalGames === 0) {
            const embed = new EmbedBuilder()
                .setDescription(`There is no match history between <@${userid}> and <@${userid2}>.`)
                .setColor('#ff0000');

            interaction.reply({ embeds: [embed] });
            return;
        }

        let user1Wins = 0;
        let user2Wins = 0;

        rows.forEach(row => {
            if (row.winner === userid) {
                user1Wins++;
            } else {
                user2Wins++;
            }
        });

        const user1WinPercentage = parseFloat(((user1Wins / totalGames) * 100).toFixed(2));
        const user2WinPercentage = parseFloat(((user2Wins / totalGames) * 100).toFixed(2));        

        const embed = new EmbedBuilder()
            .setDescription(`**Head to Head Record - <@${userid}> vs <@${userid2}>**\n\n**${toalGames}** Matches Played \n<@${userid}> has **${user1Wins} wins** (${user1WinPercentage}%)\n<@${userid2}> has **${user2Wins} wins** (${user2WinPercentage}%)`)
            .setColor('#0099ff');

        interaction.reply({ embeds: [embed] });

    },
};
