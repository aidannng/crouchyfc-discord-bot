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
        .setName('user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you want to get information about')
                .setRequired(true)
        )
        .setDescription('Provides information about the user.'),
    async execute(interaction) {
        const user = interaction.options.getUser('user');

        try {
            // Fetch user data including XP and coins from the database
            const [rows] = await pool.execute('SELECT xp, coins FROM users WHERE id = ?', [user.id]);

            if (rows) {
                const userData = rows[0];

				const formattedXP = userData.xp.toLocaleString();
				const formattedCoins = userData.coins.toLocaleString();

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setDescription(`
                        **Username:** ${user.username} (<@${user.id}>)
                        **ID:** ${user.id}
                        **XP:** ${formattedXP}
                        **Coins:** ${formattedCoins}
                    `)
                    .setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.jpg`);

                await interaction.reply({ content: '', embeds: [embed] });
            } else {
                await interaction.reply({ content: 'No data found for the specified user.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            await interaction.reply({ content: 'An error occurred while fetching user data.', ephemeral: true });
        }
    },
};
