const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db_host, db_user, db_password, db_database, MOD_ROLE, TWITCH_MOD_ROLE, TRANSCRIPTS_CHANNEL } = require('../../config.json');
const mysql = require('mysql2');
const connection = mysql.createConnection({
	host: db_host,
	user: db_user,
	password: db_password,
	database: db_database,
	port: 3306
});

module.exports = {
	data: 
    new SlashCommandBuilder()
		.setName('add')
        .setDescription('Add a user to ticket (Moderator Only)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you want to add to the ticket')
                .setRequired(true)
        ),
    async execute(interaction) {
        if(interaction.member.roles.cache.has(MOD_ROLE) || interaction.member.roles.cache.has(TWITCH_MOD_ROLE)){
            
            const channelId = interaction.channel.id;
            connection.execute('SELECT id, user_id, transcript_id, channel_id FROM tickets WHERE channel_id = ?',[channelId],function(err, result, fields) {
                if(result[0]){
                    const user = interaction.options.getUser('user');

                    interaction.channel.permissionOverwrites.create(user, { ViewChannel: true, SendMessages: true });
                    interaction.reply({ content: `Added ${user} to the ticket` });
                } else {
                    interaction.reply({ content: `This channel is not a ticket channel`, ephemeral: true });
                }
            });
        } else {
            await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
    },
};