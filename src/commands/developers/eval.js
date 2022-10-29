const { Command } = require('../../client/index');

const { inspect } = require('util');

module.exports = class EvalCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'eval',
            description: 'Execute códigos sem criar novos comandos',
            devsOnly: true,
            permissions: ['administrator'],
            required_roles: ['diretor']
        })
    }

    async run({ message, player }) {
        const msg = await message.reply({ content: `Escreva abaixo o código à ser executado.`, ephemeral: true });

        message.channel.createMessageCollector({ filter: (m) => m.author.id === message.user.id, max: 1 })

            .on('collect', async (collected) => {

                const { content } = collected;

                collected.delete();

                const user = (id) => this.client.users.find((user) => user.id == id);

                const code = content
                    .replace(/^`{3}(js)?|`{3}$/g, '')
                    .replace(/<@!?(\d{16,18})>/g, 'user($1)')
                    .replace(/<@!?(\d{16,18})>/g, 'user($1)')
                    .replace('--nolog', '')

                let result;

                try {
                    const evaled = await eval(content);

                    result = inspect(evaled, { depth: 0 });
                } catch (error) {
                    result = error.toString();
                };

                result = result.replace(/_user\((\d{16,18})\)/g, '<@$1>');

                let obj = {
                    content: `\`\`\`js\n${result}\`\`\``,
                    files: [{
                        name: 'output.js',
                        attachment: Buffer.from(result)
                    }]
                };

                if (obj.content > 2000) obj.content = 'O resultado do output excedeu o máximo de caracteres, acesse abaixo por um txt.'
                else delete obj.files;

                return message.channel.send({ ...obj }).then(m => {

                    m.react('❌');

                    m.createReactionCollector({ filter: (r, u) => r.emoji.name === '❌' && u.id === message.user.id, max: 1 })

                        .on('collect', async (r, u) => {
                            m.edit('Eval fechada.');

                        })
                })
            })
    }
}