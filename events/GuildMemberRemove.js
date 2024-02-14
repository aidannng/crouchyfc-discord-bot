const { Events } = require('discord.js');
const { db_host, db_user, db_password, db_database } = require('../config.json');
const mysql = require('mysql2/promise'); // Import the promise-based version of mysql

const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_database
});


module.exports = {
	name: Events.GuildMemberRemove,
	execute(member) {
		console.log(`Member Left - ${member.user.tag}`);

		const userId = member.id;

		pool.execute('INSERT INTO user_activity (user,type,time) VALUES (?,?,?)', [userId, "leave", Date.now() / 1000]);
	},
};