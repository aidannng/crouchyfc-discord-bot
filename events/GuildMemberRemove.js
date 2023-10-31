const { Events } = require('discord.js');
const { LEAVE_CHAT } = require('../config.json');

module.exports = {
	name: Events.GuildMemberRemove,
	execute(member) {
		console.log(`Member Left - ${member.user.tag}`);
        member.guild.channels.cache.get(LEAVE_CHAT).send(`Goodbye, <@${member.id}>`)
	},
};