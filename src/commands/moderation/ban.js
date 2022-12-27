const { Command } = require('../../client/index');

const ms = require('ms');

module.exports = class BanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            description: 'bana usuário',
            permissions: ['send_messages'],
            required_roles: ['moderador'],
            devsOnly: true,
            options: [{
                name: 'user',
                type: 3,
                description: 'Usuário a ser banido',
                required: true
            }, {
                name: 'motivo',
                type: 3,
                description: 'Motivo do banimento',
                required: true,
                choices: client.config.bans.motivos.slice(0, 25).map(motivo => ({ name: motivo.name, value: motivo.name }))
            }, {
                name: 'prova',
                type: 3,
                description: 'Prova do banimento',
                required: false
            }]
        })
    }

    async run({ message, args }) {

        const punishData = this.client.config.bans.motivos.find(motivo => motivo.name === message.options.getString('motivo'));

        if (this.checkRoles(message, punishData.required_roles[0] || 'ajudante')) return message.reply({
            content: `Você precisa do cargo \`${punishData.required_roles[0] || 'ajudante'}\` para banir com este motivo!`,
            ephemeral: true
        })

        const member = message.guild.members.cache.get(message.options.getString('user').replace(/[^0-9]/gi, ''));

        if (!member) return message.reply({
            content: 'Você deve inserir um membro válido!',
            ephemeral: true
        });

        if (member.roles.cache.has('876917665925562418')) return message.reply({
            content: 'Você não pode banir um membro da equipe!',
            ephemeral: true
        })// Equipe Role

        const time = ms(punishData.duration || '1m');

        const prova = message.options.getString('prova') || 'Prova não inserida';

        const rolesToAdd = this.client.config.bans.cargosToAdd.filter(c => !isNaN(c)).map(role => message.guild.roles.cache.get(role));

        const rolesToRemove = this.client.config.bans.cargosToRemove.filter(c => !isNaN(c)).map(role => message.guild.roles.cache.get(role));

        rolesToAdd.forEach(r => {
            message.guild.channels.cache.filter(c => !this.client.config.mutes.canaisParaTerAcesso.includes(c.id)).map(channel => {

                if (channel.permissionOverwrites.cache.get(r.id)) return true;

                channel.permissionOverwrites.create(r.id, {
                    SEND_MESSAGES: false,
                    VIEW_CHANNEL: false,
                    ADD_REACTIONS: false
                });

            });

            return r
        });

        if (this.client.bans.get(member.id)) return message.reply({
            content: 'Este usuário já está banido!',
            ephemeral: true
        });

        if (member) member.roles.add(rolesToAdd.map(r => r.id), `Usuário banido por ${message.user.tag} - Motivo: ${punishData.name} - Tempo: ${time ? ms(time) : 'PERMANENTE'}`).then(() => {
            if (rolesToRemove.size) member.roles.remove(rolesToRemove.map(r => r.id));

            message.reply({
                content: 'Usuário banido com sucesso.',
                ephemeral: true
            });

            const logsEmbed = new this.client.embed()
                .setAuthor('Rede Legit - Usuário banido', this.client.user.displayAvatarURL())
                .setFooter('Rede Legit - Usuário banido', this.client.user.displayAvatarURL())
                .setThumbnail(member.user.displayAvatarURL({ format: 'png', size: 4096 }))
                .addField(`Banido por`, message.user.toString(), true)
                .addField(`Duração`, punishData.duration || '1m', true)
                .addField(`Motivo`, punishData.name, true)
                .addField(`Provas`, prova || "Não informada", true);

            this.client.channels.cache.get(this.client.config.logs.channel).send({
                embeds: [logsEmbed]
            });

            this.client.database.ref(`RedeLegit/banidos/${member.id}`).set({
                endAt: time ? Date.now() + Number(time) : false
            });

            this.client.bans.set(member.id, time ? setTimeout(() => {
                member.roles.remove(rolesToAdd.map(r => r.id), 'Usuário desbanido automaticamente.');

                if (rolesToRemove.size) member.roles.add(rolesToRemove.map(r => r.id));

                this.client.bans.delete(member.id);

                this.client.database.ref(`RedeLegit/banidos/${member.id}`).remove();
            }, time) : true);

        }).catch(() => {
            message.reply({
                content: 'Ocorreu um erro ao banir o usuário',
                ephemeral: true
            })
        })

        else {

        }
    }
}