const { Command } = require('../../client/index');

module.exports = class StaffCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'staff',
            description: 'Veja os staffers que esão online',
            permissions: ['send_messages'],
        })
    }

    async run({ message, args }) {
        const embed = new this.client.embed()
            .setAuthor('Rede Legit - Staffers Online', this.client.user.displayAvatarURL())
            .setDescription(this.client.staffTime.sort((a, b) => b.rolePos - a.rolePos).map(staff => {
                const time = this.client.msToTime(Date.now() - staff.start);

                return `${message.guild.roles.cache.find(r => r.name === staff.role) || 'Sem cargo'} ${staff.nickname} \`${time}\` `

            }).join("\n") || 'Nenhum membro da equipe online.');

        message.reply({ embeds: [embed] })
    }
}