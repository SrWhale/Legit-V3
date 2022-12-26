const { Command } = require('../../client/index');

module.exports = class servidorCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'servidor',
            description: "Veja o status do servidor.",
            permissions: ['send_messages']
        })
    }
    async run({ message, args }) {

        message.reply({
            content: `Conecte-se já pelo IP: \`jogar.redelegit.com.br\` `,
            files: ['http://status.mclive.eu/RedeLegit/jogar.redelegit.com.br/25565/banner.png']
        });
    }
}