/* const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
		.setName('close')
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for closing the ticket')
            .setRequired(true)
        )
		.setDescription('Close a ticket! (Moderator Only)'),
    async execute(interaction) {
        if(interaction.member.roles.cache.has(MOD_ROLE) || interaction.member.roles.cache.has(TWITCH_MOD_ROLE)){
            const channelId = interaction.channel.id;
            
            connection.execute('SELECT id, user_id, transcript_id, channel_id FROM tickets WHERE channel_id = ?',[channelId],function(err, result, fields) {
                if(result[0]){
                    var transcriptid = result[0].transcript_id;
                    var user_id = result[0].user_id;
                    
                    const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Ticket #${result[0].id} Closed`)
                    .setDescription(`
                        **Opened By:** <@${result[0].user_id}>
                        **Closed By:** <@${interaction.user.id}>
                        **Close Reason:** ${interaction.options.getString('reason')}
                        **Transcript URL:** [Click Here](https://crouchyfc.iv-studios.net/transcript/${transcriptid})
                    `)
                    .setTimestamp()
                    .setFooter({ text: `${interaction.guild.name}`, iconURL: `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}` });
                    interaction.guild.channels.cache.get(TRANSCRIPTS_CHANNEL).send({ embeds: [embed] })

                    connection.execute('UPDATE tickets SET close_reason = ?, closed_by = ?, close_time = ? WHERE channel_id = ?',[interaction.options.getString('reason'), interaction.user.id, Date.now(), channelId],function(err, result, fields) {
                        if(err) throw err;
                    });

                    interaction.channel.delete();
                    
                } else {
                    interaction.reply({ content: `This channel is not a ticket channel`, ephemeral: true });
                }
            });
        } else {
            await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
    },
}; */