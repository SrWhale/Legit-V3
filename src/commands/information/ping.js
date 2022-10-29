const { Command } = require('../../client/index');

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            description: 'Veja o ping do BOT',
            permissions: ['send_messages'],
        })
    }

    async run({ message, args }) {
        return message.reply(`\`${this.client.ws.ping}ms!\``)
    }
}