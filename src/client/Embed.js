const { MessageEmbed } = require('discord.js');

module.exports = class Embed extends MessageEmbed {
    constructor(options) {
        super(options || {});

        this.color = 'GREEN'
    }
}