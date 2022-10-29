const { Command } = require('../../client/index');

const ms = require('ms');

module.exports = class MuteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            description: 'Mute um usuário',
            permissions: ['send_messages'],
            required_roles: ['ajudante'],
            options: [{
                name: 'user',
                type: 6,
                description: 'Usuário a ser mutado',
                required: true
            }, {
                name: 'motivo',
                type: 3,
                description: 'Motivo do mute',
                required: true,
                choices: client.config.mutes.motivos.map(motivo => ({ name: motivo.name, value: motivo.name }))
            }, {
                name: 'prova',
                type: 3,
                description: 'Prova do mute',
                required: false
            }]
        })
    }

    async run({ message, args }) {

        const punishData = this.client.config.mutes.motivos.find(motivo => motivo.name === message.options.getString('motivo'));

        if (this.checkRoles(message, punishData.required_roles[0] || 'ajudante')) return message.reply({
            content: `Você precisa do cargo \`${punishData.required_roles[0] || 'ajudante'}\` para mutar com este motivo!`,
            ephemeral: true
        })

        const member = message.options.getMember('user');

        if (member.roles.cache.has('876917665925562418')) return message.reply({
            content: 'Você não pode mutar um membro da equipe!',
            ephemeral: true
        })// Equipe Role

        const time = ms(punishData.duration || '1m');

        if (!time || time < 0) return message.reply({
            content: 'Este tempo é inválido!',
            ephemeral: true
        });

        const prova = message.options.getString('prova') || 'Prova não inserida';

        const rolesToAdd = this.client.config.mutes.cargosToAdd.filter(c => !isNaN(c)).map(role => message.guild.roles.cache.get(role));

        const rolesToRemove = this.client.config.mutes.cargosToRemove.filter(c => !isNaN(c)).map(role => message.guild.roles.cache.get(role));

        rolesToAdd.forEach(r => {
            message.guild.channels.cache.filter(c => !this.client.config.mutes.canaisParaTerAcesso.includes(c.id)).map(channel => {

                if (channel.permissionOverwrites.cache.get(r.id)) return true;

                channel.permissionOverwrites.create(r.id, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SPEAK: false
                });

            });

            return r
        });

        if (member.roles.cache.has(rolesToAdd.map(r => r.id))) return message.reply({
            content: 'Este usuário já está mutado!',
            ephemeral: true
        });

        member.roles.add(rolesToAdd.map(r => r.id), `Usuário mutado por ${message.user.tag} - Motivo: ${punishData.name}`).then(() => {
            if (rolesToRemove.size) member.roles.remove(rolesToRemove.map(r => r.id));

            message.reply({
                content: 'Usuário mutado com sucesso.',
                ephemeral: true
            });

            const logsEmbed = new this.client.embed()
                .setAuthor('Rede Legit - Usuário mutado', this.client.user.displayAvatarURL())
                .setFooter('Rede Legit - Usuário mutado', this.client.user.displayAvatarURL())
                .setThumbnail(member.user.displayAvatarURL({ format: 'png', size: 4096 }))
                .addField(`Mutado por`, message.user.toString(), true)
                .addField(`Duração`, punishData.duration || '1m', true)
                .addField(`Motivo`, punishData.name, true)
                .addField(`Provas`, prova || "Não informada", true);

            this.client.channels.cache.get(this.client.config.logs.channel).send({
                embeds: [logsEmbed]
            });

            this.client.database.ref(`RedeLegit/mutados/${member.id}`).set({
                endAt: Date.now() + Number(time)
            });

            this.client.mutes.set(member.id, setTimeout(() => {
                member.roles.remove(rolesToAdd.map(r => r.id), 'Usuário desmutado automaticamente.');

                if (rolesToRemove.size) member.roles.add(rolesToRemove.map(r => r.id));

                this.client.mutes.delete(member.id);

                this.client.database.ref(`RedeLegit/mutados/${member.id}`).remove();
            }, time));

        }).catch(() => {
            message.reply({
                content: 'Ocorreu um erro ao mutar o usuário',
                ephemeral: true
            })
        })
    }
}