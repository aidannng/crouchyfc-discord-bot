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
		.setName('fact')
		.setDescription('Get a random fact about the Discord server!'),
	async execute(interaction) {
		// total coins in economy || user with most coins percentage share of economy
        const ecoTotalResult = await pool.execute('SELECT SUM(coins) as total FROM users');
        const totalCoins = ecoTotalResult[0][0].total;
        const totalCoinsFormatted = totalCoins.toLocaleString();

        const userWithMostCoins = await pool.execute('SELECT id, coins FROM users ORDER BY coins DESC LIMIT 1');
        const userWithMostCoinsId = userWithMostCoins[0][0].id;
        const userWithMostCoinsCoins = userWithMostCoins[0][0].coins;
        const userWithMostCoinsCoinsFormatted = userWithMostCoinsCoins.toLocaleString();

        const embedMessage = `There are currently **${totalCoinsFormatted}** coins in the economy. <@${userWithMostCoinsId}> has the most coins with **${userWithMostCoinsCoinsFormatted}** coins and holds **${((userWithMostCoinsCoins / totalCoins) * 100).toFixed(2)}%** of the coins in the economy.`

        // total messages sent
        // user with most messages and percentage of how many messages in discord are from them
        // amount of messages in the last 24 hours / 7 days / 30 days
        // the day with the most messages (in a 24 hour period)(could add who send the most messages that day)

        // amount of coinflips done and hopw much has been gambled
        // who has done the most coinflips + their win %
        // who has won the most coinflips / lost the most coinflips
        // biggest coinflip win

        // sum of coins sent using /pay || who has sent the most money using /pay || who has received the most money using /pay

        const embed = new EmbedBuilder()
            .setDescription(embedMessage)
            .setColor('#0099ff')

        await interaction.reply({ embeds: [embed] });
	},
};