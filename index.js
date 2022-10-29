require('dotenv/config');

const { Client } = require('./src/index');

const config = require('./config.json');

const client = new Client({
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_EMOJIS_AND_STICKERS', 'GUILD_INTEGRATIONS', 'GUILD_WEBHOOKS',
        'GUILD_INVITES', 'GUILD_VOICE_STATES', 'GUILD_PRESENCES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS',
        'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'DIRECT_MESSAGE_TYPING'],
    restTimeOffset: 0,
    presence: {
        activies: {
            name: 'jogar.redelegit.com.br'
        },
        status: 'idle'
    },
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true
    }
});

client.config = config;

setInterval(() => {
    delete require.cache[require.resolve('./config.json')];
    
    client.config = require('./config.json');
}, 20000);

client.login().then(async () => {

    client.log(`BOT iniciado com sucesso.`, { color: 'green', tags: ['discord client'] });
    
    setTimeout(() => client.user.setStatus('online'), 30000)
    
    await client.connectdatabase();
    await client.loadModules();
}).catch(err => {
    console.log(err)
});

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);