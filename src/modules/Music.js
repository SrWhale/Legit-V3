const { Manager } = require('erela.js');

const Spotify = require('erela.js-spotify');

const nodes = [{
    tag: 'Node 2',
    host: process.env.LAVALINK_NODE_1_HOST,
    port: Number(process.env.LAVALINK_NODE_1_PORT),
    password: process.env.LAVALINK_NODE_1_PASSWORD,
    identifier: 'Node 1',
    API: process.env.LAVALINK_NODE_1_API
}, {
    tag: 'Node 2',
    host: process.env.LAVALINK_NODE_2_HOST,
    port: Number(process.env.LAVALINK_NODE_2_PORT),
    password: process.env.LAVALINK_NODE_2_PASSWORD,
    identifier: 'Node 2',
    API: process.env.LAVALINK_NODE_2_API
}];

module.exports = class musicLoader {
    constructor(client) {
        this.client = client;
    }

    async start() {
        this.client.music = new Manager({
            nodes,
            autoPlay: true,
            send: (guildID, data) => {
                const guild = this.client.guilds.cache.get(guildID);

                if (guild) guild.shard.send(data);
            },
            plugins: [
                new Spotify({
                    clientID: process.env.SPOTIFY_CLIENT_ID,
                    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
                })
            ]
        })

        this.client.log(`Manager de músicas iniciado.`, { tags: ['Music'], color: 'green' });
    }
}