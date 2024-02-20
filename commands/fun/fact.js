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
        const randomFacts = 8;
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
            const [coinflipsResult] = await pool.execute('SELECT COUNT(*) AS total, SUM(amount) AS total_bet FROM coin_flips');
            const totalCoinflips = parseInt(coinflipsResult[0].total);
            const totalCoinflipsFormatted = totalCoinflips.toLocaleString();
            const totalBet = parseInt(coinflipsResult[0].total_bet);
            const totalBetFormatted = totalBet.toLocaleString();

            embedMessage = `There have been **${totalCoinflipsFormatted}** coinflips played with a total of **${totalBetFormatted}** coins gambled.`

        } else if(randomNumber === 5) {
            // who has done the most coinflips + their win %
            const [coinflipsResult] = await pool.execute('SELECT u.id, COUNT(*) AS total, SUM(winner = u.id) AS wins FROM coin_flips c LEFT JOIN users u ON u.id = c.challenger GROUP BY c.challenger ORDER BY total DESC LIMIT 1');
            const userWithMostCoinflipsId = coinflipsResult[0].id;
            const userWithMostCoinflipsTotal = coinflipsResult[0].total;
            const userWithMostCoinflipsWins = coinflipsResult[0].wins;
            const userWithMostCoinflipsWinPercentage = parseFloat(((userWithMostCoinflipsWins / userWithMostCoinflipsTotal) * 100).toFixed(2));

            embedMessage = `<@${userWithMostCoinflipsId}> has played the most coinflips in the server, playing **${userWithMostCoinflipsTotal}** coinflips and has a win percentage of **${userWithMostCoinflipsWinPercentage}%**.`
        } else if(randomNumber === 6) {
            // who has won the most coinflips / lost the most coinflips
            const [coinflipsResult] = await pool.execute('SELECT u.id, COUNT(*) AS total, SUM(winner = u.id) AS wins FROM coin_flips c LEFT JOIN users u ON u.id = c.winner GROUP BY c.winner ORDER BY wins DESC LIMIT 1');
            const userWithMostWinsId = coinflipsResult[0].id;
            const userWithMostWinsTotal = coinflipsResult[0].total;
            const userWithMostWinsWins = coinflipsResult[0].wins;
            const userWithMostWinsWinPercentage = parseFloat(((userWithMostWinsWins / userWithMostWinsTotal) * 100).toFixed(2));

            const [coinflipsResult2] = await pool.execute('SELECT u.id, COUNT(*) AS total, SUM(winner != u.id) AS losses FROM coin_flips c LEFT JOIN users u ON u.id = c.winner GROUP BY c.winner ORDER BY losses DESC LIMIT 1');
            const userWithMostLossesId = coinflipsResult2[0].id;
            const userWithMostLossesTotal = coinflipsResult2[0].total;
            const userWithMostLossesLosses = coinflipsResult2[0].losses;
            const userWithMostLossesLossPercentage = parseFloat(((userWithMostLossesLosses / userWithMostLossesTotal) * 100).toFixed(2));
            
            embedMessage = `<@${userWithMostWinsId}> has won the most coinflips in the server, winning **${userWithMostWinsWins}** coinflips and has a win percentage of **${userWithMostWinsWinPercentage}%**. <@${userWithMostLossesId}> has lost the most coinflips in the server, losing **${userWithMostLossesLosses}** coinflips and has a loss percentage of **${userWithMostLossesLossPercentage}%**.`
        } else if(randomNumber === 7) {
            // biggest coinflip win
            const [coinflipsResult] = await pool.execute('SELECT * FROM coin_flips ORDER BY amount DESC LIMIT 1');
            const biggestCoinflip = coinflipsResult[0];
            const biggestCoinflipAmount = biggestCoinflip.amount;
            const biggestCoinflipAmountFormatted = biggestCoinflipAmount.toLocaleString();

            embedMessage = `The biggest coinflip win was **${biggestCoinflipAmountFormatted}** coins, won by <@${biggestCoinflip.winner}> against <@${biggestCoinflip.challenger}>.`
        } else if(randomNumber === 8) {
            // sum of coins sent using /pay || who has sent the most money using /pay || who has received the most money using /pay
            const [payResult] = await pool.execute('SELECT SUM(amount) AS total FROM coins_payment');
            const totalPay = parseInt(payResult[0].total);
            const totalPayFormatted = totalPay.toLocaleString();

            const [payResult2] = await pool.execute('SELECT u.id, SUM(amount) AS total FROM coins_payment p LEFT JOIN users u ON u.id = p.from GROUP BY p.from ORDER BY total DESC LIMIT 1');
            const userWithMostPaySentId = payResult2[0].id;
            const userWithMostPaySentTotal = parseFloat(payResult2[0].total);
            const userWithMostPaySentTotalFormatted = userWithMostPaySentTotal.toLocaleString();

            const [payResult3] = await pool.execute('SELECT u.id, SUM(amount) AS total FROM coins_payment p LEFT JOIN users u ON u.id = p.to GROUP BY p.to ORDER BY total DESC LIMIT 1');
            const userWithMostPayReceivedId = payResult3[0].id;
            const userWithMostPayReceivedTotal = parseFloat(payResult3[0].total);
            const userWithMostPayReceivedTotalFormatted = userWithMostPayReceivedTotal.toLocaleString();

            embedMessage = `There have been a total of **${totalPayFormatted}** coins sent using /pay.\n<@${userWithMostPaySentId}> has sent the most coins with a total of **${userWithMostPaySentTotalFormatted}** coins sent.\n<@${userWithMostPayReceivedId}> has received the most coins with a total of **${userWithMostPayReceivedTotalFormatted}** coins received.`
        }
        

        
        const embed = new EmbedBuilder()
            .setDescription(embedMessage)
            .setColor('#0099ff')

        await interaction.reply({ embeds: [embed] });
	},
};