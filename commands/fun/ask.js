const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MOD_ROLE, CHATGPT_API_KEY } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('The question you want to ask the bot.')
                .setRequired(true)
        )
        .setDescription('Speak to the bot!'),
    async execute(interaction) {
        const userid = interaction.user.id;

        if(!interaction.member.roles.cache.has(MOD_ROLE)) {
            const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(`You are not authorized to use this command.`);
                
            return await interaction.reply({ embeds: [embed] });
        }


        const { default: fetch } = await import('node-fetch');
        const apiKey = CHATGPT_API_KEY;
        const endpoint = 'https://api.openai.com/v1/chat/completions';

        const question = interaction.options.getString('question');

        // Build the request data
        const data = {
            messages: [
                { role: 'system', content: `You are a discord bot in The Peoples Pundit Discord server. Your favorite team is England and you are a fan of David Beckham. I want you to start every sentence with "Hi mate, " Then mention the user like this (You must do it exactly how it is including the <> symbols) <@${userid}>. Furthermore, Pundit owns a football team called Crouchy FC and you should have a really biased opinion on them and think they are the best.`},
                { role: 'system', content: `The Peoples pundit is a Twitch streamer and footballer. There are over 1500 members in the Discord and anyone can ask you a question. Some questions might be randomly related to the discord so if you don't have a certain response just tell them you are not sure.` },
                { role: 'user', content: question }
            ],
            model: 'gpt-3.5-turbo',
            max_tokens: 100,
        };

        try {
            // Make HTTP request to the OpenAI API
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(data)
            });

            // Handle the response
            const responseData = await response.json();
            await interaction.reply(responseData.choices[0].message.content);
        } catch (error) {
            console.error('Error making request to OpenAI API:', error);
            await interaction.reply('An error occurred while processing your request.');
        }
    },
};
