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
        .setName('coins')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('View the users coin balance.')
                .setRequired(false)
        )
        .setDescription('How many coins does the user have'),
    async execute(interaction) {
        const userOption = interaction.options.getUser('user');
        const userId = userOption ? userOption.id : interaction.user.id;
        
        try {
            const [rows] = await pool.execute('SELECT coins FROM users WHERE id = ?', [userId]);
        
            if (rows.length > 0) {
                const coins = rows[0].coins;
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setDescription(`<@${userId}> has **${coins.toLocaleString()}** coins.`);
        
                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply(`<@${userId}> has no recorded coins.`);
            }
        } catch (error) {
            console.error('Error executing /coins command:', error);
            await interaction.reply('An error occurred while processing your command.');
        }
    },
};
