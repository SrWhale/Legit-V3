const { Command } = require('../../client/index');

module.exports = class canalCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'canal',
            description: 'Gerencie o canal que o BOT substituirá as mensagens',
            permissions: ['send_messages'],
            required_roles: ['gerente'],
            options: [{
                name: 'adicionar',
                required: false,
                type: 1,
                description: 'Adicione um canal',
                options: [{
                    name: 'canal',
                    required: true,
                    type: 7,
                    description: 'Canal à ser adicionado'
                }]
            }, {
                name: 'remover',
                required: false,
                type: 1,
                description: 'Remova um canal',
                options: [{
                    name: 'canal',
                    required: true,
                    type: 7,
                    description: 'Canal à ser removido'
                }]
            }, {
                name: 'listar',
                required: false,
                type: 1,
                description: 'Liste os canais'
            }]
        })
    }

    async run({ message, args }) {
        async function getSubCommand() {
            return message.options.getSubcommand('adicionar') || message.options.getSubcommand('remover')
        };
        
        const subCommand = await getSubCommand();
        
        const canal = message.options.getChannel('canal');
        
        if(subCommand === 'adicionar') {
            
            const has = this.client.sayChannels[canal.id];
            
            if(has) return message.reply({
                content: 'Este canal já está adicionado!',
                ephemeral: true
            });
            
            this.client.database.ref(`RedeLegit/sayChannels/${canal.id}`).set(true);
            
            this.client.sayChannels[canal.id] = true;
            
            message.reply({
                content: 'Canal adicionado com sucesso.',
                ephemeral: true
            })
        } else if(subCommand === 'remover') {
            
            const has = this.client.sayChannels[canal.id];
            
            if(!has) return message.reply({
                content: 'Este canal não está configurado!',
                ephemeral: true
            });
            
            this.client.database.ref(`RedeLegit/sayChannels/${canal.id}`).remove();
            
            delete this.client.sayChannels[canal.id];
            
            message.reply({
                content: 'Canal removido com sucesso!',
                ephemeral: true
            })
        } else if(subCommand === 'listar') {
            const channels = Object.keys(this.client.sayChannels).map(channel => this.client.channels.cache.get(channel)?.toString() || 'Canal não encontrado.');
            
            if(!channels.length) return message.reply({
                content: 'Não há nenhum canal configurado no momento.'
            });
            
            return message.reply({
                content: `Canais configurados: \n\n${channels.join('\n')}`,
                ephemeral: true
            })
        }
    }
}