const { SlashCommandBuilder } = require('discord.js');
const { db_host, db_user, db_password, db_database } = require('../../config.json');
const { formatTimeDifference } = require('../../functions.js');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflips')
        .setDescription('View all the coin flips waiting for a challenger.'),
    async execute(interaction) {
        try {
            const [rows] = await pool.execute('SELECT * FROM coin_flips WHERE challenger = 0');
            if (rows.length > 0) {

                const embed = {
                    color: 0x0099ff,
                    title: 'Active Coin Flips',
                    fields: [],
                };
                
                rows.forEach(row => {
                    const side = row.side.charAt(0).toUpperCase() + row.side.slice(1); 
                
                    embed.fields.push({
                        name: ``,
                        value: `<@${row.created}> | ${row.amount} Coins | ${side} | ${formatTimeDifference(row.time)}`
                    });
                });
                              
                await interaction.reply({ embeds: [embed] });
            } else {
                const embed = {
                    color: 0x0099ff,
                    title: 'There are no coin flips active at the moment.',
                    fields: [],
                };
                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error executing /coinflip command:', error);
            await interaction.reply('An error occurred while processing your command.');
        }
    },
};
