const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { DEVELOPER_USER_ID, db_host, db_user, db_password, db_database } = require('../../config.json');
const mysql = require('mysql2/promise'); // Import the promise-based version of mysql

const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Special Command for Aidan only'),
    async execute(interaction) {
        if (interaction.user.id == DEVELOPER_USER_ID) {
            let usersProcessed = 0;
            let usersInserted = 0;

            const guild = interaction.guild;

            guild.members.cache.forEach(async member => {
                const userId = member.id;

                // Check if the user already exists in the database
                const [rows] = await pool.execute('SELECT COUNT(*) as userCount FROM users WHERE id = ?', [userId]);

                usersProcessed++;

                if (rows[0].userCount === 0) {
                    const userJoined = member.joinedTimestamp;
                    const userName = member.user.username;

                    await pool.execute('INSERT INTO users (id,username) VALUES (?,?)', [userId, userName]);
                    await pool.execute('INSERT INTO user_activity (user,time) VALUES (?,?)', [userId, userJoined]);

                    usersInserted++;
                }
            });

            await interaction.reply({ content: `User setup completed. Iterated through **${usersProcessed}** users in the guild. Found **${usersInserted}** users not in database.` });
        } else {
            await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
    },
};
