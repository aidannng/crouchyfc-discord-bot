const { Events, EmbedBuilder } = require('discord.js');
const { JOIN_ROLE, db_host, db_user, db_password, db_database } = require('../config.json');
const mysql = require('mysql2/promise'); // Import the promise-based version of mysql

const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database
});


module.exports = {
	name: Events.GuildMemberAdd,
	execute(member) {
		console.log(`Member Joined - ${member.user.tag}`);

		member.roles.add(JOIN_ROLE);

		const userId = member.id;
		const userJoined = member.joinedTimestamp;
		const userName = member.user.username;


		

		pool.execute('INSERT IGNORE INTO users (id, username) VALUES (?, ?)', [userId, userName]);
		pool.execute('INSERT INTO user_activity (user,time) VALUES (?,?)', [userId, userJoined]);
	},
};