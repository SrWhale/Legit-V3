const { schedule } = require('node-cron');

const moment = require('moment');

moment.locale('pt-br');

const ms = require('ms');

function convertData(data) {
    const [day, month, others] = data.split('/');
    const [year, hour] = others.split(" ");

    return new Date(`${year}/${month}/${day} ${hour}`).getTime();
};

const punishes = {
    AC: {
        type: 'BAN',
        time: '1d'
    },
    HACK: {
        type: 'BAN',
        time: 'PERM'
    },
    AUTOCLICKER: {
        type: 'BAN',
        time: 'PERM'
    },
    RECUSARTELAGEM: {
        type: 'BAN',
        time: 'PERM'
    },
    ASSUMIRUSODEHACK: {
        type: 'BAN',
        time: '90d'
    },
    RASTROEMTELAGEM: {
        type: 'BAN',
        time: '30d'
    },
    DESCONECTAREMTELAGEM: {
        type: 'BAN',
        time: 'PERM'
    },
    ABUSODEBUGS: {
        type: 'BAN',
        time: '30d'
    },
    ANTIJOGOGAME: {
        type: 'BAN',
        time: '3d'
    },
    FALSIFICARPROVAS: {
        type: 'BAN',
        time: '90d'
    },
    INVASAODECONTA: {
        type: 'BAN',
        time: 'PERM'
    },
    TENTATIVADESUBORNOAEQUIPE: {
        type: 'BAN',
        time: '60d'
    },
    SKININAPROPRIADA: {
        type: 'BAN',
        time: '1d'
    },
    NICKNAMEINADEQUADO: {
        type: 'BAN',
        time: 'PERM'
    },
    AMEACA: {
        type: 'BAN',
        time: '7d'
    },
    AMEACAAOSERVIDOR: {
        type: 'BAN',
        time: 'PERM'
    },
    DESINFORMACAO: {
        type: 'BAN',
        time: '3d'
    },
    ASSEDIOABUSOVERBAL: {
        type: 'BAN',
        time: '5d'
    },
    CHANTAGEM: {
        type: 'BAN',
        time: '7d'
    },
    INCENTIVARUSODEPROGRAMASILEGAIS: {
        type: 'BAN',
        time: '5d'
    },
    DESOBEDIENCIAASTAFF: {
        type: 'BAN',
        time: '7d'
    },
    MODIFICARARQUIVOSDURANTEATELAGEM: {
        type: 'BAN',
        time: 'PERM'
    },
    ANTIJOGOCHAT: {
        type: 'MUTE',
        time: '5h'
    },
    DISCRIMINACAO: {
        type: 'MUTE',
        time: '7d'
    },
    DIVULGACAOGRAVE: {
        type: 'MUTE',
        time: 'PERM'
    },
    DIVULGACAOSIMPLES: {
        type: 'MUTE',
        time: '1d'
    },
    INCENTIVARFLOOD: {
        type: 'MUTE',
        time: '3h'
    },
    OFENSAAJOGADOR: {
        type: 'MUTE',
        time: '3h'
    },
    OFENSAAOSERVIDORSTAFF: {
        type: 'MUTE',
        time: '5d'
    },
    COMERCIO: {
        type: 'MUTE',
        time: '3d'
    },
    SPAM: {
        type: 'MUTE',
        time: '1h'
    },
    FLOOD: {
        type: 'MUTE',
        time: '5h'
    },
    CONVERSAEXPLICITA: {
        type: 'MUTE',
        time: '3d'
    }
}

const types = {
    BAN: ['hack', 'Uso_de_autoclicker', 'Recusar_telagem', 'Assumir_uso_de_hack', 'Rastro_em_telagem', 'Desconectar_em_telagem', 'Abuso_de_bugs', 'Anti_jogo_Game', 'Falsificar_provas', 'Invasao_de_conta', 'Tentativa_de_suborno_a_equipe', 'Skin_inapropriada', 'Nickname_inadequado', 'Ameaca', 'Ameaca_ao_servidor', 'Desinformacao', 'Assedio_abuso_verbal', 'Chantagem', 'Incentivar_uso_de_programas_ilegais', 'Desobediencia_a_staff', 'Modificar_arquivos_durante_a_telagem'].map(p => p.replace(/_/gi, '').toUpperCase()),
    MUTE: ['Anti_jogo_chat', 'Discriminacao', 'Divulgacao_grave', 'Divulgacao_simples', 'Incentivar_flood', 'Ofensa_a_jogador', 'Ofensa_ao_servidor_staff', 'Comercio', 'Spam', 'Flood', 'Conversa_explicita'].map(p => p.replace(/_/gi, '').toUpperCase())
}

module.exports = class punishSync {
    constructor(client) {
        this.client = client;
    }

    async start() {
        // this.checkEndedPunish();
        this.logPunish();
    };

    async checkEndedPunish() {
        const members = this.client.guilds.cache.get('564398372161585162').members.cache.filter(m => m.roles.has('oi'))
    }

    async logPunish() {
        let lastPunish = [];

        setInterval(async () => {

            let query = await new this.client.utils().getMysqlInformation2(this.client, 'SELECT * FROM punish.global_punishes');

            query = query === "noFound" ? [{ id: 'yes' }] : query;

            if (!lastPunish.length) {
                lastPunish = query;

            } else {
                const punishAdded = query.filter(c => !lastPunish.find(u => u.id === c.id));

                lastPunish = [...lastPunish, ...punishAdded];

                const guild = this.client.guilds.cache.get('564398372161585162');

                if (punishAdded.length) {

                    try {
                        punishAdded.map(async p => {
                            const user = await new this.client.utils(this.client).getUserID(this.client, p.playerName);

                            const type = punishes[p.reason];

                            const embed = new this.client.embed()
                                .setAuthor('Rede Legit - Log de Punições', this.client.user.displayAvatarURL())
                                .addField('Usuário punido:', p.playerName, true)
                                .addField('Autor:', p.stafferName, true)
                                .addField('Motivo', p.reason, true)
                                .addField('Provas:', p.proof === 'null' ? 'Indisponível' : p.proof, true)
                                .addField('Data de aplicação:', moment(Date.now() - ms('3h')).format('LLL'), true)
                                .addField('Data de expiração:', p.expires === 0 ? 'Nunca' : moment((Date.now() - ms('3h')) + ms(type.time)).format('LLL'), true);

                            await this.client.channels.cache.get('748691106346303592').send({ embeds: [embed] });

                            this.client.database.ref(`RedeLegit/Punishs/${p.stafferName}`).push({
                                type: type.type,
                                plataform: 'SERVIDOR'
                            })

                            if (user && guild.members.cache.get(user)) {
                                if (!type) return console.log(`Punição ${p.reason} não existe.`);

                                const member = guild.members.cache.get(user)

                                member.roles.add(type.type === 'MUTE' ? [...this.client.config.mutes.cargosToAdd] : [...this.client.config.bans.cargosToAdd]);

                                member.send({ embeds: [new this.client.embed().setDescription(`Você acaba de ser punido em nosso servidor e sua punição foi vinculada.`)] });

                            }

                        })
                    } catch (err) {
                        console.log(err)
                    }
                }

                const punishRemoved = lastPunish.filter(c => !query.find(q => q.id === c.id) && c.id !== 'yes');

                punishRemoved.map(async p => {

                    lastPunish.splice(lastPunish.findIndex(c => c.id === p.id), 1);

                    const user = await new this.client.utils().getUserID(this.client, p.playerName);

                    const type = punishes[p.reason];

                    const embed = new this.client.embed()
                        .setAuthor('Rede Legit - Log de punições expiradas', this.client.user.displayAvatarURL())
                        .addField('Usuário despunido:', p.playerName, true)
                        .addField('Autor:', p.stafferName, true)
                        .addField('Motivo', p.reason, true)
                        .addField('Provas:', p.proof === 'null' ? 'Indisponível' : p.proof, true)
                        .addField('Data de aplicação:', moment(Date.now() - ms('3h')).format('LLL'), true)
                        .addField('Data de expiração:', p.expires === 0 ? 'Nunca' : moment(Date.now() + ms(type.time)).format('LLL'), true)
                        .setColor('YELLOW')
                    await this.client.channels.cache.get('748691106346303592').send({ embeds: [embed] });

                    if (query.find(u => u.playerName === p.playerName && punishes[u.reason] === punishes[p.reason])) return console.log('ja tem', p)

                    if (user && guild.members.cache.get(user)) {

                        const member = guild.members.cache.get(user);

                        member.roles.remove(type.type === 'MUTE' ? [...this.client.config.mutes.cargosToAdd] : [...this.client.config.bans.cargosToAdd]);

                        member.send({ embeds: [new this.client.embed().setDescription(`Você acaba de ser despunido em nosso servidor e por isso também foi em nosso Discord.`)] });
                    }
                });
            }
        }, 7000)
    }
};

