const axios = require('axios');
const { DataResolver } = require('discord.js');

const { Command } = require('../../client/index');

module.exports = class serverCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'serveradmin',
            description: "Gerencie os servidores da rede",
            permissions: ['ADMINISTRATOR'],
            required_roles: ['administrador'],
            options: [{
                name: 'ação',
                type: 3,
                required: true,
                description: "Ação a ser executada",
                choices: ['status', 'ligar', 'desligar', 'reiniciar', 'matar'].map(a => ({ name: a, value: a }))
            }, {
                name: 'server',
                type: 3,
                required: false,
                description: 'Servidor(es) a ser afetado',
                choices: ['all', 'lobby', 'auth', 'skywars', 'bedwars'].map(a => ({ name: a, value: a }))
            }]
        })
    }
    async run({ message, args }) {
        console.log('oi ne');
        const servers = await this.client.nodeactyl.getAllServers();

        console.log(servers)
        const server = message.options.getString('server');

        const action = message.options.getString('ação');

        const serversToAction = server ? server === 'all ' ? servers.data : servers.data.filter(sv => sv.attributes.name.toLowerCase().includes(server)) : servers.data;

        if (action === 'status') {

            const status = serversToAction.map(sv => `${sv.attributes.status === 'running' ? '<:ping3:972517836310323331>' : '<:Offline:972517279550029894>'} **${sv.attributes.name}**`)

            const embed = new this.client.embed()
                .setAuthor('Status dos servidores', this.client.user.displayAvatarURL())
                .setDescription(status.join("\n"))
                .setFooter(`Solicitado por ${message.user.tag}`, message.user.displayAvatarURL({ dynamic: true }));

            message.reply({ embeds: [embed], fetchReply: true }).then(m => this.serverStatus(m, serversToAction, embed))
        };

        if (['ligar', 'reiniciar', 'desligar', 'matar'].includes(action)) {
            const status = serversToAction.map(sv => `**${sv.attributes.name}** ❌`)

            const embed = new this.client.embed()
                .setAuthor('Confirme a ação', this.client.user.displayAvatarURL())
                .setDescription(status.join("\n"))
                .setFooter(`Confirme a ação`, message.user.displayAvatarURL({ dynamic: true }));

            message.reply({ embeds: [embed], fetchReply: true }).then(async m => {
                await m.react('✅')
                await m.react('❌')

                m.createReactionCollector({ filter: (reaction, user) => user.id === message.user.id && ['✅', '❌'].includes(reaction.emoji.name), time: 10000, limit: 1, max: 1 })
                    .on('collect', async (reaction, user) => {

                        switch (reaction.emoji.name) {
                            case '✅':
                                await this.postAction(m, serversToAction, embed, action)
                                break;
                            case '❌':
                                m.edit({ content: 'Operação cancelada.', embeds: [] });
                                break;
                        }
                    })
            })
        }
    }

    async serverStatus(message, servers, embed) {
        for (const server of servers) {
            await new Promise(async res => {
                const status = await this.client.nodeactyl.getServerStatus(server.attributes.identifier);
                console.log(status);

                servers[servers.findIndex(s => s.attributes.identifier === server.attributes.identifier)].attributes.status = status;

                const statusMsg = servers.map(sv => `${sv.attributes.status === 'running' ? '<:ping3:972517836310323331>' : '<:Offline:972517279550029894>'} **${sv.attributes.name}**`)

                embed.setAuthor('Status dos servidores', this.client.user.displayAvatarURL())
                embed.setDescription(statusMsg.join("\n"))

                message.edit({
                    embeds: [embed]
                });

                setTimeout(() => res(true), 500)
            })
        }
    };

    async postAction(message, servers, embed, action) {

        const handleAction = {
            'ligar': 'start',
            'reiniciar': 'restart',
            'desligar': 'stop',
            'matar': 'kill'
        };

        let alread = [];

        for (const server of servers) {
            await new Promise(async res => {
                const execute = await this.client.nodeactyl[`${handleAction[action]}Server`](server.attributes.identifier);

                alread.push(server.attributes.identifier);

                const statusMsg = servers.map(sv => `**${sv.attributes.name}** ${alread.includes(sv.attributes.identifier) ? '✅' : '❌'}`)

                embed.setAuthor('Executando...', this.client.user.displayAvatarURL())
                embed.setDescription(statusMsg.join("\n"))

                message.edit({
                    embeds: [embed]
                });

                setTimeout(() => res(true), 500)
            })
        };

        embed.setAuthor('Ação finalizada.', this.client.user.displayAvatarURL());
        embed.setFooter('Ação finalizada.', message.user.displayAvatarURL({ dynamic: true }))

        message.edit({
            embeds: [embed]
        })
    };
}