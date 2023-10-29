const { Events, EmbedBuilder } = require('discord.js');
const { LOGS_CHANNEL, ANTIAD_BYPASS_ROLE, BLOCK_USER_PINGS, MOD_ROLE } = require('../config.json');

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
        if(message.author.bot) return; // ignore bots

        // ANTI ADVERTISEMENT SYSTEM
        if(message.content.includes('discord.gg')) {
            if(!message.member.roles.cache.has(ANTIAD_BYPASS_ROLE)){
                message.delete();
                message.channel.send(`<@${message.author.id}>, do not send Discord invites in this server`)

                const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Discord Invite Deleted`)
                .setDescription(`
                    **User:** <@${message.author.id}>
                    **Message:** ${message.content}
                    **Channel:** <#${message.channel.id}>
                    **Time:** <t:${Math.round(+new Date()/1000)}>
                    `
                )
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}` });
                message.guild.channels.cache.get(LOGS_CHANNEL).send({ content: `<@${message.author.id}> sent a Discord Invite`, embeds: [embed] })
            }
        }

        // ANTI TAG SYSTEM
        if(message.mentions.members.size) {
            BLOCK_USER_PINGS.forEach(userId => {
                if(message.mentions.members.has(userId) && !message.member.roles.cache.has(MOD_ROLE)) {
                    message.delete();
                    message.channel.send(`<@${message.author.id}>, do not ping this user. Please contact an Administrator if you need support.`);
                }
            });

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Anti Tag System`)
                .setDescription(`
                    **User:** <@${message.author.id}>
                    **Message:** ${message.content}
                    **Channel:** <#${message.channel.id}>
                    **Time:** <t:${Math.round(+new Date()/1000)}>
                    `
                )
                .setTimestamp()
                .setFooter({ text: `${message.guild.name}`, iconURL: `https://cdn.discordapp.com/icons/${message.guild.id}/${message.guild.icon}` });
                message.guild.channels.cache.get(LOGS_CHANNEL).send({ content: `<@${message.author.id}> tagged someone on the anti tag list`, embeds: [embed] })
        }

	},
};