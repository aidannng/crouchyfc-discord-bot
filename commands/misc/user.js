const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db_host, db_user, db_password, db_database } = require('../../config.json');
const { getLevel } = require('../../functions');
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
                .setRequired(false)
        )
        .setDescription('Provides information about the user.'),
    async execute(interaction) {
        const userOption = interaction.options.getUser('user');
        const user = userOption ? userOption.id : interaction.user.id;

        try {
            // Fetch user data including XP and coins from the database
            const [rows] = await pool.execute('SELECT u.*, COALESCE(m.message_count, 0) AS message_count FROM users u LEFT JOIN (SELECT user, COUNT(id) AS message_count FROM messages GROUP BY user) m ON u.id = m.user WHERE u.id = ?', [user])

            if (rows) {
                const userData = rows[0];

				const formattedXP = userData.xp.toLocaleString();
				const formattedCoins = userData.coins.toLocaleString();
                const formattedMessages = userData.message_count.toLocaleString();
                const level = getLevel(userData.xp);

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setDescription(`
                        **Username:** ${userData.username} (<@${user}>)
                        **ID:** ${user}
                        **XP:** ${formattedXP} (Level ${level})
                        **Coins:** ${formattedCoins}
                        **Messages:** ${formattedMessages}
                    `)
                    .setThumbnail(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.jpg`);

                await interaction.reply({ content: '', embeds: [embed] });
            } else {
                await interaction.reply({ content: 'No data found for the specified user.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error executing /user command:', error);
            await interaction.reply({ content: 'An error occurred while fetching user data.', ephemeral: true });
        }
    },
};
