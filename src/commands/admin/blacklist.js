const { Constants: { ApplicationCommandOptionTypes } } = require('discord.js');

const { Command } = require('../../client/index');

module.exports = class blaclistCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'blacklist',
            description: 'Adicione um jogador na blacklist',
            permissions: ['ADMINISTRATOR'],
            required_roles: ['diretor'],
            options: [{
                name: 'nick',
                required: true,
                type: ApplicationCommandOptionTypes.STRING,
                description: 'Nickname do usuário'
            }]
        })
    }

    async run({ message, args }) {

        const nick = message.options.getString('nick');

        const user = await new this.client.utils(this.client).getUserID(this.client, nick);

        if (!user) return message.reply({
            content: 'Usuário inexistente!',
            ephemeral: true
        });

        this.client.nodeactyl.sendServerCommand('aa080fba', 'blacklist add ' + nick);

        const mysql = new this.client.utils();

        mysql.getMysqlInformation(this.client, `UPDATE forum.users SET role = '38' WHERE name = '${nick}'`);

        mysql.getMysqlInformation(this.client, `UPDATE commons.accounts SET group_name = 'NORMAL' WHERE username = '${nick}'`);

        const guildMember = this.client.guilds.cache.get(process.env.PRINCIPAL_GUILD).members.cache.get(user);

        guildMember.roles.remove(guildMember.roles.cache.filter(r => r.id !== process.env.PRINCIPAL_GUILD).map(r => r.id));

        setTimeout(() => {
            guildMember.roles.add(this.client.config.bans.cargosToAdd)
        }, 4000);

        message.reply({
            content: `O usuário ${nick} foi adicionado na blacklist!`,
        })

    }
}