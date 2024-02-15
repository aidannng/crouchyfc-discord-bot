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
        .setName('xp')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('View the users amount of Xp.')
                .setRequired(false)
        )
        .setDescription('How much Xp does the user have'),
    async execute(interaction) {
        const userOption = interaction.options.getUser('user');
        const userId = userOption ? userOption.id : interaction.user.id;

        try {
            const [rows] = await pool.execute('SELECT u.xp, COUNT(m.id) AS messageCount FROM users u LEFT JOIN messages m ON u.id = m.user WHERE u.id = ?', [userId]);

            if (rows.length > 0) {
                const xp = rows[0].xp;
                const messages = rows[0].messageCount;
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`<@${userId}> has **${xp.toLocaleString()}** Xp and has sent **${messages.toLocaleString()}** messages. (Level System Coming Soon)`);

                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply(`<@${userId}> has no recorded Xp.`);
            }
        } catch (error) {
            console.error('Error executing xp command:', error);
            await interaction.reply('An error occurred while processing your command.');
        }

    },
};
