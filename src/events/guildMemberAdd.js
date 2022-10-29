module.exports = class guildMemberUpdateEvent {
    constructor(client) {
        this.client = client;
    }

    async run(member) {
        if (Date.now() - member.createdTimestamp < require('ms')(this.client.config.anti_fake.time_to_block)) {
            member.roles.add(this.client.config.anti_fake.role_to_add);

            member.guild.channels.filter(c => !this.client.config.anti_fake.channels_to_acess.includes(c.id)).forEach(c => {
                if (c.permissionOverwrites.cache.get(this.client.config.anti_fake.role_to_add)) return true;

                channel.permissionOverwrites.create(this.client.config.anti_fake.role_to_add, {
                    SEND_MESSAGES: false,
                    SPEAK: false,
                    ADD_REACTIONS: false
                });
            })
        }
    }
}