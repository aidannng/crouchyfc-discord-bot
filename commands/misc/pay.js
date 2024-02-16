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
        .setName('pay')
        .setDescription('Send Coins to another user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The User you want to send coins to')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('The amount of coins you want to send to the user')
                .setRequired(true)
                .setMinValue(1)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        // Check if the user is sending to them self
        if (user.id === interaction.user.id) {
            const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription(`You cannot send coins to yourself!`);
        
            return await interaction.reply({ embeds: [embed] });
        }

        // check if user has enough to send
        const [coins] = await pool.execute('SELECT coins FROM users WHERE id = ?', [interaction.user.id]);
        if (coins[0].coins < amount) {
            const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription(`You do not have enough coins to send **${amount.toLocaleString()}** coins to <@${user.id}>`);
        
            return await interaction.reply({ embeds: [embed] });
        }

        // send coins to other user and remove coins from interaction
        try {
            await pool.execute('UPDATE users SET coins = coins - ? WHERE id = ?', [amount, interaction.user.id]);
            await pool.execute('UPDATE users SET coins = coins + ? WHERE id = ?', [amount, user.id]);
            await pool.execute('INSERT INTO coins_statements (user, amount, type, description, time) VALUES (?, ?, ?, ?, ?)', [interaction.user.id, amount, "decrease", `Sent ${amount} coins to ${user.username}`, Date.now() / 1000]);
            await pool.execute('INSERT INTO coins_statements (user, amount, type, description, time) VALUES (?, ?, ?, ?, ?)', [user.id, amount, "increase", `Received ${amount} coins from ${interaction.user.username}`, Date.now() / 1000]);

            const embed = new EmbedBuilder()
            .setColor('#00ff51')
            .setDescription(`<@${interaction.user.id}> has sent **${amount.toLocaleString()}** coins to <@${user.id}>!`);
        
            await interaction.reply({ content: `<@${user.id}>`, embeds: [embed] });
        } catch (error) {
            console.error('Error executing pay command:', error);
            await interaction.reply('An error occurred while processing your command.');
        }


       
    },
};
