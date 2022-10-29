const { Command } = require('../../client/index');

const isURL = require('is-url');
const isImageURL = require('is-image-url')

const Tesseract = require('tesseract.js');

module.exports = class testeComand extends Command {
    constructor(client) {
        super(client, {
            name: 'teste',
            description: 'Comando de Teste',
            permissions: ['send_messages'],
            required_roles: ['diretor'],
            options: [{
                name: 'variables',
                type: 3,
                description: 'Exemplo: X: 30 Y: 40 (separe por espaços)',
                required: false
            }]
        })
    }

    async run({ message, args }) {
        message.reply({
            content: 'Seja bem-vindo, por favor, insira a imagem para que eu possa resolver a equação.',
            ephemeral: true
        });
        
        const collector = message.channel.createMessageCollector({ filter: m => m.author.id === message.user.id, max: 1, time: 30000 })
        
        .on('collect', async (collected) => {
            const url = collected.attachments.first()?.url || collected.content;
            
            if (!url || !isURL(url) || !isImageURL(url)) return message.channel.send({
                content: 'Você deve inserir uma imagem válida!'
            });
            
            const msg = await message.channel.send({
                content: 'Lendo imagem...'
            });
            
            const { data } = await Tesseract.recognize(url).then(data => data);
            
            if(!data || !data.text) return msg.edit({
                content: 'Sinto muito, mas não há nada que eu consiga ler nesta imagem.'
            });
            
            const EquationSolver = require('equations');
            
            let equations = await Promise.all(data.text.split('\n').filter(e => e.length && e.length > 3).map(async e => {
                return new Promise(res => {
                    e = e.replace('?', '²');
                    
                    const variables = message.options.getString('variables');
                    
                    const variable = e[0];
                    
                    e = e.replace('=', '');
                    
                    e = e.substring(1, e.length);
                    
                    const result = EquationSolver.default.solve(e);
             
                    EquationSolver.default.registerConstant(variable, () => result);
                    
                    return res({
                        variable,
                        result,
                        equation: e
                    });
                });
            })).then(res => {
                return msg.edit({
                    content: `Veja abaixo o resultado: \n\n${res.map(equation => `${equation.variable}: ${equation.result}`).join("\n")}`
                });
            });
        });
    };
};