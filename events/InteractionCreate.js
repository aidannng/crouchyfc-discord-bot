const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, } = require('discord.js');
const { db_host, db_user, db_password, db_database, MOD_ROLE, TWITCH_MOD_ROLE, HIGHLIGHTS_CHAT, DEVELOPER_USER_ID, SUPPORT_CATEGORY, TWITCH_SUPPORT_CATEGORY } = require('../config.json');
const mysql = require('mysql2');
const connection = mysql.createConnection({
	host: db_host,
	user: db_user,
	password: db_password,
	database: db_database,
	port: 3306
});

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
        if (!interaction.isModalSubmit() && !interaction.isButton()) return;

        if(interaction.customId === 'ticket_support') { // BUTTON -> TICKET GENERAL SUPPORT
            const modal = new ModalBuilder()
            .setCustomId('general-support-ticket')
            .setTitle('General Support Ticket')
            
            const openingticket = new TextInputBuilder()
            .setCustomId('openingTicket')
            .setLabel('Why are you opening this ticket?')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(200)
            .setMinLength(20)
            .setPlaceholder('Why are you opening this ticket?')
            .setRequired(true);
    
            const firstActionRow = new ActionRowBuilder().addComponents(openingticket);

            modal.addComponents(firstActionRow);
            interaction.showModal(modal); 

        } else if(interaction.customId === 'ticket_twitch') { // BUTTON -> TICKET TWITCH SUPPORT
            const modal = new ModalBuilder()
            .setCustomId('twitch-support-ticket')
            .setTitle('Twitch Related Support Ticket')
            
            const openingticket = new TextInputBuilder()
            .setCustomId('openingTicket')
            .setLabel('Why are you opening this ticket?')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(200)
            .setMinLength(20)
            .setPlaceholder('Why are you opening this ticket?')
            .setRequired(true);
    
            const firstActionRow = new ActionRowBuilder().addComponents(openingticket);

            modal.addComponents(firstActionRow);
            interaction.showModal(modal); 
        } else if(interaction.customId === 'ticket_highlights') { // BUTTON -> SUBMIT HIGHLIGHTS
            interaction.reply({ content: `For more information on how to submit your highlights, please visit <#${HIGHLIGHTS_CHAT}>`, ephemeral: true })
        } else if(interaction.customId === 'general-support-ticket' || interaction.customId === 'twitch-support-ticket' ) { // MODAL -> TICKET SUBMIT
            connection.execute(
                'SELECT COUNT(id) AS tickets, channel_id FROM `tickets` WHERE `user_id` = ? AND `close_time` = ?',
                [interaction.user.id, 0],
                function(err, result, fields) {
                    if(result[0].tickets === 0){
                        connection.execute('SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_name = ? AND table_schema = DATABASE( ) ;',["tickets"],
                        function(err, resulttwo, fields) {
                            var ticket_id = resulttwo[0].AUTO_INCREMENT
                            var ticket_reason = interaction.fields.getTextInputValue('openingTicket');
                            var ticket_author = interaction.user.id

                            if(interaction.customId === 'general-support-ticket'){
                                var tickets_category = SUPPORT_CATEGORY
                                var role = MOD_ROLE
                            } else if(interaction.customId === 'twitch-support-ticket'){
                                var tickets_category = TWITCH_SUPPORT_CATEGORY
                                var role = TWITCH_MOD_ROLE
                            }
                            
                            interaction.guild.channels.create({name: `ticket-${ticket_id}`, type: 0, parent: tickets_category,}).then(channel_result => {
                                connection.execute('INSERT INTO `tickets` SET user_id = ?, transcript_id = ?, channel_id = ?, open_reason = ?, category = ?, time = ?',[ticket_author, channel_result.id+ticket_author, channel_result.id, ticket_reason, tickets_category, Date.now()])
                                channel_result.setTopic(`**Ticket Open Reason:** ${ticket_reason}`)
                                channel_result.send(`<@${ticket_author}> has opened a ticket. Please be patient for a <@&${role}> to respond to your ticket.\n\n**Ticket Open Reason:** ${ticket_reason}`)
                                interaction.reply({ content: `Your ticket has been created! <#${channel_result.id}>`, ephemeral: true });
                                channel_result.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: false });
                                channel_result.permissionOverwrites.edit(ticket_author, { ViewChannel: true });
                                channel_result.permissionOverwrites.edit(role, { ViewChannel: true });
                            });
                        })
                    } else {
                        interaction.reply({ content: `You already have an open ticket. <#${result[0].channel_id}>`, ephemeral: true });
                    }
                }
            );
        }
	},
};