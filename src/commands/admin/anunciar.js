const { Command } = require('../../client/index');

module.exports = class anunciarCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'anunciar',
            description: 'Anuncie algo',
            permissions: ['send_messages'],
            required_roles: ['gerente']
        })
    }

  async run({ message, args }) {

    const response = {};


    const questions = [
      {
        name: '➤ Por favor, insira o título do Embed.',
        save: 'titulo',
        img: ''
      },
      {
        name: '➤ Agora insira o conteúdo do Embed.',
        save: 'conteudo',
        img: ''
      },
      {
        name: '➤ Agora insira o que ficará no Footer do Embed.',
        save: 'footer',
        img: ''
      },
      {
        name: '➤ Agora, caso haja alguma imagem para ser anexada, insira ela (Caso não haja, insira qualquer coisa).',
        save: 'imagem',
        img: ''
      },
      {
        name: '➤ Agora preciso saber em qual canal o Embed será enviado.',
        save: 'canal',
        img: ''
      },
      {
          name: '➤ Caso deseje que eu envie everyone, diga "sim"',
          save: 'mention',
          img: ''
      }
    ];

    const collector = message.channel.createMessageCollector({ filter: m => m.author.id === message.user.id });

    let state = -1;
      
    message.deferReply();
      
    let msg;


    const sendQuestion = async (send = false) => {
      state++;

      if (questions[state]) {

        if (send === true) {
            
            const e = new this.client.embed()
            	.setDescription(questions[state].name)
            	.setFooter(`➤ Escreva 'cancelar' no chat a qualquer momento para cancelar a operação ou 'pular' para pular a opção.`, this.client.user.displayAvatarURL());
            
            	if(questions[state].img) embed.setImage(questions[state].img)
            
          msg = msg ? await msg.edit({
              embeds: [e]
          }) : await message.channel.send({ embeds: [e] });
        }

      } else {
        collector.stop();

        const embed = new this.client.embed()
          if(response['titulo']) embed.setAuthor(response['titulo'], this.client.user.displayAvatarURL())
          if(response['conteudo']) embed.setDescription(response['conteudo'])
          if(response['footer']) embed.setFooter(response['footer'], this.client.user.displayAvatarURL());
          if (response['imagem'].startsWith('http')) embed.setImage(response['imagem'])
          
          if(!Object.values(response).length) return message.editReply({
              content: 'Você deve fazer um anúncio válido!'
          });
          
        this.client.channels.cache.get(response['canal']).send({ embeds: [embed]});
        if(response['mention'].toString().toLowerCase() === 'sim') this.client.channels.cache.get(response['canal']).send(`${message.guild.roles.everyone}`).then(msg => msg.delete({timeout: 1000}))
        message.editReply({
            content: `➤ O Embed foi enviado com sucesso.`
        });
          
          msg.delete();
      }
    }

    sendQuestion(true);



    collector.on('collect', async content => {
        
        if(content.content.toLowerCase() === 'pular') return sendQuestion(true);
      if (content.content.length >= 2048) {
        this.reply(`➤ Sua mensagem é grande demais e ultrapassou os limites do discord! Envie uma menor.`);
        state--
        return sendQuestion(false);
      }

      if (content.content.toLowerCase() === 'cancelar') {
        collector.stop();
        return this.reply(`➤ Operação cancelada com sucesso.`)

      }
      const question = questions[state];

      if (['titulo', 'footer', 'conteudo'].includes(question.save)) content = content.content;

      if (question.save === 'canal' && !this.client.channels.cache.get(content) && !content.mentions.channels.first()) {
        this.reply(`➤ Não foi possível encontrar o canal, por favor, insira um canal válido!`);
        state--
        return sendQuestion(false);
      }

      if (question.save === 'canal') content = content.mentions.channels.first() ? content.mentions.channels.first().id : this.client.channels.cache.get(content.content);

      if (question.save === 'imagem') content = content.attachments.first() ? content.attachments.first().url : content.content;
      response[question.save] = content;
      sendQuestion(true)

    })
  }
}