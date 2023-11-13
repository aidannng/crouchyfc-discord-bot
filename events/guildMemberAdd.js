const { Events, EmbedBuilder } = require('discord.js');
const { WELCOME_CHAT, JOIN_ROLE, guildId } = require('../config.json');

module.exports = {
	name: Events.GuildMemberAdd,
	execute(member) {
		console.log(`Member Joined - ${member.user.tag}`);

		member.roles.add(JOIN_ROLE);

		/* const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(`Welcome, ${member.user.username}!`)
		.setDescription(`
			**User:** <@${member.id}>
			**User joined:** <t:${Math.round(+new Date()/1000)}>
			**Member Count:** #${member.guild.memberCount}
			`
		)
		.setThumbnail(`https://cdn.discordapp.com/avatars/${member.id}/${member.user.avatar}.jpg`)
		.setTimestamp()
		.setFooter({ text: `${member.guild.name}`, iconURL: `https://cdn.discordapp.com/icons/${guildId}/${member.guild.icon}` });
		member.guild.channels.cache.get(WELCOME_CHAT).send({ content: `<@${member.id}> Grab your sofa, grab your popcorn!`, embeds: [embed] }) */
	},
};