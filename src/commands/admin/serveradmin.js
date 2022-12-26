const axios = require('axios');

const { Command } = require('../../client/index');

module.exports = class serverCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'serveradmin',
            aliases: [],
            description: "Gerencie os servidores da rede",
            permissions: ['ADMINISTRATOR'],
            required_roles: ['administrador'],
            options: [{
                name: 'ação',
                type: 3,
                required: true,
                description: "Ação a ser executada",
                choices: ['status'].map(a => ({ name: a, value: a }))
            }, {
                name: 'server',
                type: 3,
                required: false,
                description: 'Servidor(es) a ser afetado',
                choices: ['all', 'lobby', 'auth', 'skywars', 'bedwars'].map(server => ({ name: server, value: server }))
            }]
        })
    }
    async run({ message, args }) {

        const servers = await this.client.nodeactyl.getAllServers();

        const server = message.options.getString('server');

        const action = message.options.getString('ação');

        const serversToAction = server ? servers.data.filter(sv => sv.attributes.name.toLowerCase().includes(server)) : servers.data;

        if (action === 'status') {
            const status = serversToAction.map(sv => `${sv.attributes.status === 'running' ? ':ping3:' : ':Offline~1:'} ${sv.attributes.name}`).join('');

            const embed = new this.client.embed()
                .setAuthor('Status dos servidores', this.client.user.displayAvatarURL())
                .setDescription(status)
                .setFooter(`Solicitado por ${message.user.tag}`, message.user.displayAvatarURL({ dynamic: true }))
        }

        // if (server === 'all') {

        //     for (const sv in servers) {
        //         new Promise(async res => {
        //             const result = await this.postAction(sv.attributes.identifier, { signal: action });

        //             res(result)
        //         });

        //     }

        //     message.reply({
        //         content: 'Pronto!'
        //     })
        // } else {
        //     const typeServers = servers.data.filter(sv => sv.attributes.name.toLowerCase().includes(server))

        //     if (!typeServers.length) return message.reply('Não consegui encontrar este servidor.');

        //     for (const sv of typeServers) {
        //         new Promise(async res => {
        //             const result = await this.postAction(sv.attributes.identifier, { signal: action });
        //             res(result)
        //         })
        //     }

        //     message.reply({
        //         content: 'Pronto!'
        //     })
        // }
    }

    async postAction(serverID, data) {
        return new Promise(res => {
            axios({
                url: `https://pterodactyl.redelegit.com.br/api/client/servers/${serverID}/power`,
                method: 'POST',
                maxRedirects: 5,
                data: data,
                headers: {
                    'Authorization': `Bearer ${process.env.PTERO_API}`,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).then(result => {
                console.log(result.data);
                res(result)
            }).catch(async err => {
                console.log(err);
                await res(await this.postAction(serverID, data))
            })
        })
    }
}