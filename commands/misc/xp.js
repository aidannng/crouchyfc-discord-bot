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
                .setRequired(true)
        )
        .setDescription('How much Xp does the user have'),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        
        try {
            const [rows] = await pool.execute('SELECT xp FROM users WHERE id = ?', [user.id]);

            if (rows.length > 0) {
                const xp = rows[0].xp;
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`<@${user.id}> has **${xp.toLocaleString()}** Xp. (Level System Coming Soon)`);

                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply(`${user.tag} has no recorded Xp.`);
            }
        } catch (error) {
            console.error('Error executing coins command:', error);
            await interaction.reply('An error occurred while processing your command.');
        }
    },
};
