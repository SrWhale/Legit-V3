const { Command } = require('../../client/index');

module.exports = class staffinfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'staffinfo',
            description: 'Veja o perfil de um staff',
            permissions: ['send_messages'],
            required_roles: ['estagiário'],
            options: [{
                name: 'staff',
                type: 6,
                description: 'Nick ou menção do staff.',
                required: true
            }]
        })
    }

    async run({ message, args }) {
        const staff = this.client.guilds.cache.get(process.env.STAFF_GUILD).members.cache.get(message.options.getUser('staff').id);

        if (!staff) return message.reply({
            content: 'Não consegui encontrar esse staff! Verifique se ele está no servidor da equipe.',
            ephemeral: true
        });

        await message.reply({
            content: 'Carregando perfil, aguarde...',
            fetchReply: true
        }).then(msg => {
            setTimeout(async () => {
                const staffTime = await this.client.database.ref(`RedeLegit/stafftime/${staff.displayName}`).once('value').then(res => res.val() || 0);

                const punishes = await this.client.database.ref(`RedeLegit/Punishs/${staff.displayName}`).once('value').then(res => Object.values(res.val() || {}));

                const lastSee = await this.client.database.ref(`RedeLegit/lastSee/${staff.displayName}`).once('value').then(res => res.val() || 0);

                const utils = new this.client.utils();

                const staffEmbed = new this.client.embed()
                    .setAuthor(`Perfil de ${staff.displayName}`, this.client.user.displayAvatarURL())
                    .setThumbnail(`https://mc-heads.net/avatar/${staff.displayName}`)
                    .addField('Cargo:', staff.roles.highest.toString(), true)
                    .addField('Tempo online', `\`${utils.msToTime(staffTime)}\` `, true)
                    .addField('Visto por último', `<t:${Math.floor(lastSee / 1000)}:F>`, true)
                    .addField(`Mutes`, `Servidor: \`${punishes.filter(p => p.type === 'MUTE' && p.plataform === 'SERVIDOR').length}\`\nDiscord: \`${punishes.filter(p => p.type === 'MUTE' && p.plataform === 'DISCORD').length}\``, true)
                    .addField(`Bans`, `Servidor: \`${punishes.filter(p => p.type === 'BAN' && p.plataform === 'SERVIDOR').length}\`\nDiscord: \`${punishes.filter(p => p.type === 'BAN' && p.plataform === 'DISCORD').length}\``, true)
                    .setFooter(`Pedido por ${message.member.displayName}`, message.member.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                msg.edit({
                    embeds: [staffEmbed],
                    content: null
                });
            }, 1500)
        })
    }
}