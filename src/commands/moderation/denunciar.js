const { Command } = require('../../client/index');

const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');

const format = `HACK Uso de programas ilícitos
  ASSUMIRUSODEHACK Assumir uso de hack
  ABUSODEBUGS Abuso de bugs
  ANTIJOGOGAME Anti jogo (Game)
  TENTATIVADESUBORNOAEQUIPE Tentativa de suborno à equipe
  SKININAPROPRIADA Skin inapropriada
  NICKNAMEINADEQUADO Nickname inadequado
  AMEACA Ameaça
  AMEACAAOSERVIDOR Ameça ao servidor
  DESINFORMACAO Desinformação 
  ASSEDIOABUSOVERBAL Assédio/abuso verbal
  CHANTAGEM Chantagem
  INCENTIVARUSODEPROGRAMASILEGAIS Incentivar uso de programas ilegais
  DESOBEDIENCIAASTAFF Desobediência à staff
  ANTIJOGOCHAT Anti jogo (chat)
  DISCRIMINACAO Discriminação
  DIVULGACAOGRAVE Divulgação grave
  DIVULGACAOSIMPLES Divulgação simples
  INCENTIVARFLOOD Incentivar flood
  OFENSAAJOGADOR Ofensa à jogador
  OFENSAAOSERVIDORSTAFF Ofensa à staff/servidor
  COMERCIO Comércio
  SPAM Spam
  FLOOD Flood
  CONVERSAEXPLICITA Conversa explícita`.split('\n').map(e => e.trim()).reduce((acc, cur) => {
    const split = cur.split(" ");

    acc[split.slice(1).join(" ").toLowerCase()] = split[0];

    return acc;
}, {});

module.exports = class ReportCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'denunciar',
            description: 'reporte um usuário',
            permissions: ['send_messages'],
            required_roles: ['ajudante'],
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
                choices: [...Object.keys(format).map(m => ({ name: m, value: m }))]
            }, {
                name: 'prova',
                type: 3,
                description: 'Prova do banimento',
                required: true
            }]
        })
    }

    async run({ message, args }) {

        const user = message.options.getString('user');

        const motivo = message.options.getString('motivo');

        const prova = message.options.getString('prova');

        if (!format[motivo.toLowerCase()]) return message.reply({ content: 'Ocorreu um erro ao reportar com este motivo. Reporte ao pauloheroo.', ephemeral: true })
        if (!prova.startsWith('https')) return message.reply({
            content: 'A prova deve ser um link!',
        });

        const checkNick = await new this.client.utils().validateNickname(this.client, user);

        if (!checkNick) return message.reply({
            content: 'Usuário inexistente!',
            ephemeral: true
        });

        const embed = new this.client.embed()
            .setAuthor('Aguardando Avaliação', this.client.user.displayAvatarURL())
            .addField('Usuário denunciado:', user, true)
            .addField('Autor:', message.member.displayName, true)
            .addField('Motivo', motivo, true)
            .addField('Provas:', prova, true)
            .setColor('YELLOW')

        const row = new MessageActionRow()
            .addComponents([
                new MessageButton()
                    .setStyle('SUCCESS')
                    .setCustomId('aceitar')
                    .setLabel(" "),

                new MessageButton()
                    .setStyle('DANGER')
                    .setCustomId('negar')
                    .setLabel(' '),
                new MessageButton()
                    .setStyle('PRIMARY')
                    .setCustomId('analisar')
                    .setLabel('Analisar')
            ]);

        message.reply({
            content: 'Usuário denunciado com sucesso.',
            ephemeral: true
        });

        let analisador;

        this.client.channels.cache.get('875820206235217941').send({ embeds: [embed], components: [row] }).then(msg => {

            msg.createMessageComponentCollector()


                .on('collect', async button => {

                    if (!['875813807207891024', '875813781882695763', '875813692581748746', '875813633744068729', '716809071109472319'].some(r => button.member.roles.cache.get(r))) return button.reply({
                        content: 'Você não tem autorização para avaliar denúncias!',
                        ephemeral: true
                    });

                    switch (button.customId) {
                        case 'aceitar':
                            if (!analisador) return message.reply({ content: 'Inicie a análise da denúncia antes de aceitar!', ephemeral: true });

                            if (button.user.id !== analisador) return message.reply({ content: 'Você não pode aceitar uma denúncia que não iniciou a análise!', ephemeral: true });

                            this.client.analisando.delete(button.user.id);

                            embed.setAuthor('Denúncia aceita.', this.client.user.displayAvatarURL());
                            embed.setColor('GREEN')
                            embed.setFooter('Aceita por: ' + button.user.username, this.client.user.displayAvatarURL())
                            msg.edit({ embeds: [embed], components: [] });

                            new this.client.utils().realizePunicao(this.client, user, format[motivo.toLowerCase()], prova)
                                .then(() => {
                                    setTimeout(() => {
                                        new this.client.utils().getMysqlInformation2(this.client, `UPDATE punishs.global_punishes SET stafferName = '${button.member.displayName}' WHERE playerName = '${user}' AND proof = '${prova}' AND reason = '${format[motivo]}'`)
                                            .then(console.log)
                                    }, 5000);
                                })

                            button.deferUpdate()
                            break;

                        case 'negar':
                            if (!analisador) return message.reply({ content: 'Inicie a análise da denúncia antes de negar!', ephemeral: true });

                            if (button.user.id !== analisador) return message.reply({ content: 'Você não pode negar uma denúncia que não iniciou a análise!', ephemeral: true });

                            this.client.analisando.delete(button.user.id);

                            embed.setAuthor('Denúncia negada.', this.client.user.displayAvatarURL());
                            embed.setFooter('Negada por: ' + button.user.username, this.client.user.displayAvatarURL())
                            embed.setColor("RED")
                            msg.edit({ embeds: [embed], components: [] });
                            button.deferUpdate()

                            break;

                        case 'analisar':
                            analisador = button.user.id;

                            if (this.client.analisando.get(button.user.id)) return button.reply({ content: 'Você já está analisando uma denúncia!', ephemeral: true });

                            this.client.analisando.set(button.user.id, true)

                            embed.setAuthor('Em análise por ' + button.user.tag, this.client.user.displayAvatarURL());
                            embed.setColor('YELLOW')

                            msg.edit({ embeds: [embed], components: [row.spliceComponents(2, 1)] });

                            button.reply({ content: 'Você iniciou a análise da denúncia.', ephemeral: true });
                            break;
                    }
                })
        })

    }
}