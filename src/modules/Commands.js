const { readdirSync, stat } = require('fs');

const { join } = require('path');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = class commandLoader {
    constructor(client) {
        this.client = client;
    }

    async start() {
        await this.loadCommands('src/commands');

        setTimeout(() => this.registerSlashCommands(), 2000);
    }

    async loadCommands(path) {
        const files = readdirSync(path);

        files.forEach(file => {
            const filePath = join(path, file);

            stat(filePath, async (err, stats) => {
                if (stats.isDirectory()) {
                    return this.loadCommands(filePath);
                } else if (stats.isFile()) {

                    const command = new (require(`../../${filePath}`))(this.client);

                    if (command.name === 'server') {
                        const servers = await this.client.nodeactyl.getAllServers().then(res => res.data);

                        command.options[1].choices.push(...servers.map(s => ({ name: s.attributes.name, value: s.attributes.name })))
                    }
                    this.client.commands.set(command.name, command);

                    return command;
                }
            })
        })

    }

    async registerSlashCommands() {

        const commands = this.client.commands.filter(c => c);

        const rest = new REST({ version: '9' }).setToken(this.client.token);

        try {

            await rest.put(Routes.applicationCommands(this.client.user.id), {
                body: commands
            })

            const slashCommands = await this.client.api.applications(this.client.user.id).commands.get().catch(ces => console.log(ces))

            const guild = this.client.guilds.cache.get(process.env.PRINCIPAL_SERVER);

            for (const command of slashCommands) {

                this.client.commands.get(command.name).id = command.id;

                const cmd = this.client.commands.get(command.name);
            }

            this.client.log(`Slash Commands atualizados.`, { color: 'green', tags: ['Slash Commands'] });
        } catch (err) {
            this.client.log(`Ocorreu um erro ao atualizar os slash commands.\n ${err}`, { color: 'red', tags: ['Slash Commands'] });
        }

    }
}