const { Command } = require('../../client/index');

module.exports = class MuteAdminCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'muteadmin',
            description: 'Painel admin do sistema de mutes',
            permissions: ['send_messages'],
            required_roles: ['gerente'],
            options: [{
                name: 'addmotivo',
                required: false,
                type: 1,
                description: 'Adicione um motivo ao sistema de mute',
                options: [{
                    name: 'motivo',
                    required: true,
                    type: 3,
                    description: 'Motivo a ser adicionado'
                }]
            }, {
                name: 'removemotivo',
                required: false,
                type: 1,
                description: 'Remova um motivo ao sistema de mute',
                options: [{
                    name: 'motivo',
                    required: true,
                    type: 3,
                    description: 'Motivo a ser removido'
                }]
            },{
                name: 'addcargo',
                required: false,
                type: 1,
                description: 'Adicione um cargo ao sistema de mute',
                options: [{
                    name: 'cargo',
                    required: true,
                    type: 8,
                    description: 'Cargo a ser adicionado'
                }]
            }, {
                name: 'removecargo',
                required: false,
                type: 1,
                description: 'Remove um cargo ao sistema de mute',
                options: [{
                    name: 'cargo',
                    required: true,
                    type: 8,
                    description: 'Cargo a ser removido'
                }]
            }, {
                name: 'listar',
                required: false,
                type: 1,
                description: 'Veja como o sistema de mutes está configurado.'
            }]
        })
    }

    async run({ message, args }) {
        async function getSubCommand() {
            return message.options.getSubcommand('addmotivo') || message.options.getSubcommand('removemotivo') || message.options.getSubcommand('addcargo') || message.options.getSubcommand('removecargo') || message.options.getSubcommand('listar'); 
        };
        
        const subCommand = await getSubCommand();
        
        const motivo = message.options.getString('motivo')?.toLowerCase()
        
        switch(subCommand) {
            case 'addmotivo':

                
                if(this.client.muteModule.motivos[motivo]) return message.reply({
                    content: 'Este motivo já existe!',
                    ephemeral: true
                });
                
                this.client.muteModule.motivos[motivo] = true;
                
                this.client.database.ref(`RedeLegit/muteModule/motivos/${motivo}`).set(true);
                
                this.updateMuteCommand();
                
                return message.reply({
                    content: 'Motivo adicionado com sucesso.'
                });
                
                break;
                
            case 'removemotivo': 
                
                
                
                if(this.client.muteModule.motivos[motivo]) return message.reply({
                    content: 'Este motivo não existe!',
                    ephemeral: true
                });
                
                delete this.client.muteModule.motivos[motivo];
                
                this.client.database.ref(`RedeLegit/muteModule/motivos/${motivo}`).remove()
                
                this.updateMuteCommand();
                
                return message.reply({
                    content: 'Motivo removido com sucesso.'
                });
                
                break;
        }
    }
    
    async updateMuteCommand() {
        this.client.api.application[this.client.user.id].commands[this.client.commands.get('mute').id].patch({
            options: []
        })
    }
}