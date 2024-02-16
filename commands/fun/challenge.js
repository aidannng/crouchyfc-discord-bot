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
        .setName('challenge')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Challenge a user with an active coinflip.')
                .setRequired(true)
        )
        .setDescription('Challenge a user with an active coinflip.'),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        
        // Check if the user already has an active coin flip
        const [activeCoinFlips] = await pool.execute('SELECT COUNT(*) AS count FROM coin_flips WHERE created = ? AND winner = ?', [user.id, 0]);
        if(!activeCoinFlips[0].count > 0) {
            return await interaction.reply('This user does not have an active coinflip.');
        } 

        // ensure the user is not challenging themselves
        if (user.id === interaction.user.id) {
            return await interaction.reply('You cannot challenge yourself.');
        }

        // get the conflip details
        const [coinFlip] = await pool.execute('SELECT * FROM coin_flips WHERE created = ? AND winner = ?', [user.id, 0]);
        const coinFlipDetails = coinFlip[0];
        const challengerSide = coinFlipDetails.side === 'heads' ? 'tails' : 'heads';

        // ensure user has enough coins
        const [userCoins] = await pool.execute('SELECT coins FROM users WHERE id = ?', [interaction.user.id]);
        const userCoinsAmount = userCoins[0].coins;
        if (userCoinsAmount < coinFlipDetails.amount){
            return await interaction.reply('You don\'t have enough coins to challenge this user.');
        }

        // determine a random winner
        const winner = Math.random() < 0.5 ? user.id : interaction.user.id;
        const loser = winner === user.id ? interaction.user.id : user.id;

        // determine the winner's coins
        if(interaction.user.id === winner) {
            var winnerCoins = coinFlipDetails.amount * 2 - coinFlipDetails.amount;
        } else {
            var winnerCoins = coinFlipDetails.amount * 2;
        }
        
        // update the coinflip details
        await pool.execute('UPDATE users SET coins = coins + ? WHERE id = ?', [winnerCoins, winner]);

        if (interaction.user.id === loser) {
            await pool.execute('UPDATE users SET coins = coins - ? WHERE id = ?', [coinFlipDetails.amount, interaction.user.id]);
        }

        await pool.execute('UPDATE coin_flips SET challenger = ?, winner = ? WHERE id = ?', [interaction.user.id, winner, coinFlipDetails.id]);

        await pool.execute('INSERT INTO coins_statements (user, amount, type, description, time) VALUES (?,?,?,?,?)', [winner, winnerCoins, 'increase', `Won a coinflip against <@${loser}>`, new Date() / 1000]);
        await pool.execute('INSERT INTO coins_statements (user, amount, type, description, time) VALUES (?,?,?,?,?)', [loser, coinFlipDetails.amount, 'decrease', `Lost a coinflip against <@${winner}>`, new Date() / 1000]);

        return await interaction.reply(`The coinflip has been completed. The winner is <@${winner}> and they have won ${winnerCoins} coins. Loser is <@${loser}>.`);

    },
};
