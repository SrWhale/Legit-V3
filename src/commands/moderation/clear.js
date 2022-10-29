const { Command } = require('../../client/index');

module.exports = class clearCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'clear',
            description: 'Limpe o chat',
            permissions: ['send_messages'],
            required_roles: ['administrador'],
            options: [{
                name: 'quantidade',
                type: 4,
                description: 'Quantidade de mensagens à serem apagadas.',
                required: true
            }]
        })
    }

    async run({ message, args }) {
        const amount = message.options.getInteger('quantidade');
        
        if(amount <= 0 || amount > 100) return message.reply({
            content: 'A quantidade de mensagens deve ser maior que 0 e no máximo 100!',
            ephemeral: true
        });
        
        message.channel.bulkDelete(Number(amount), true).then(() => {
            message.channel.send({
                content: `O chat foi limpo por **${message.user.tag}**.`
            });
            
            message.reply({
                content: 'Chat limpo com sucesso.',
                ephemeral: true
            })
        }, (err) => message.reply({
            content: 'Ocorreu um erro ao limpar o chat.',
            ephemeral: true
        }))
    }
}