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
        const randomFacts = 3;
        const randomNumber = Math.floor(Math.random() * randomFacts) + 1;
        let embedMessage = '';
        
        // total coins in economy || user with most coins percentage share of economy
        if(randomNumber === 1) {
        const [ecoTotalResult] = await pool.execute('SELECT SUM(coins) as total FROM users');
        const totalCoins = parseInt(ecoTotalResult[0].total);
        const totalCoinsFormatted = totalCoins.toLocaleString();
        const userWithMostCoins = await pool.execute('SELECT id, coins FROM users ORDER BY coins DESC LIMIT 1');
        const userWithMostCoinsId = userWithMostCoins[0][0].id;
        const userWithMostCoinsCoins = userWithMostCoins[0][0].coins;
        const userWithMostCoinsCoinsFormatted = userWithMostCoinsCoins.toLocaleString();

        embedMessage = `There are currently **${totalCoinsFormatted}** coins in the economy. <@${userWithMostCoinsId}> has the most coins with **${userWithMostCoinsCoinsFormatted}** coins and holds **${((userWithMostCoinsCoins / totalCoins) * 100).toFixed(2)}%** of the coins in the economy.`
        
        } else if(randomNumber === 2) {
            // total messages sent  user with most messages and percentage of how many messages in discord are from them
            const [messagesResult] = await pool.execute('SELECT COUNT(id) as total FROM messages');
            const totalMessages = parseInt(messagesResult[0].total);
            const totalMessagesFormatted = totalMessages.toLocaleString();

            const userWithMostMessages = await pool.execute('SELECT u.id, IFNULL(m.message_count, 0) AS message_count FROM users u LEFT JOIN (SELECT user, COUNT(*) AS message_count FROM messages GROUP BY user) m ON u.id = m.user ORDER BY message_count DESC LIMIT 1');
            const userWithMostMessagesId = userWithMostMessages[0][0].id;
            const userWithMostMessagesMessages = userWithMostMessages[0][0].message_count;
            const userWithMostMessagesMessagesFormatted = userWithMostMessagesMessages.toLocaleString();
    
            embedMessage = `There have been **${totalMessagesFormatted}** messages sent in the Discord since 14th February. <@${userWithMostMessagesId}> has sent the most messages with **${userWithMostMessagesMessagesFormatted}** messages and **${((userWithMostMessagesMessages / totalMessages) * 100).toFixed(2)}%** of the messages sent in the Discord server.`
    

        } else if(randomNumber === 3) {
        // amount of messages in the last 24 hours / 7 days / 30 days
        const [messages24Result] = await pool.execute('SELECT COUNT(*) AS total FROM messages WHERE time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY))');
        const messages24 = parseInt(messages24Result[0].total);
        const messages24Formatted = messages24.toLocaleString();

        const mostMessages24User = await pool.execute('SELECT u.id, IFNULL(m.message_count, 0) AS message_count FROM users u LEFT JOIN (SELECT user, COUNT(*) AS message_count FROM messages WHERE time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY)) GROUP BY user) m ON u.id = m.user ORDER BY message_count DESC LIMIT 1;');
        const mostMessages24UserId = mostMessages24User[0][0].id;
        const mostMessages24UserMessages = mostMessages24User[0][0].message_count;
        const mostMessages24UserMessagesFormatted = mostMessages24UserMessages.toLocaleString();

        embedMessage = `There have been **${messages24Formatted}** messages sent in the last 24 hours. <@${mostMessages24UserId}> has sent the most messages with **${mostMessages24UserMessagesFormatted}** messages. The user has sent **${((mostMessages24UserMessages / messages24) * 100).toFixed(2)}%** of the messages in the last 24 hours and averages **${(mostMessages24UserMessages / 24).toFixed(2)}** messages per hour.`
        } else if(randomNumber === 45) {
            // the day with the most messages (in a 24 hour period)(could add who send the most messages that day)


        } else if(randomNumber === 4) {
            // amount of coinflips done and hopw much has been gambled

        } else if(randomNumber === 5) {
            // who has done the most coinflips + their win %
        } else if(randomNumber === 7) {
            // who has won the most coinflips / lost the most coinflips
        } else if(randomNumber === 8) {
            // biggest coinflip win
        } else if(randomNumber === 9) {
            // sum of coins sent using /pay || who has sent the most money using /pay || who has received the most money using /pay
        }
        

        
        const embed = new EmbedBuilder()
            .setDescription(embedMessage)
            .setColor('#0099ff')

        await interaction.reply({ embeds: [embed] });
	},
};