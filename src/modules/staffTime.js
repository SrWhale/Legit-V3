const { get } = require('axios');
const { Collection, GuildAuditLogs } = require('discord.js');

const util = require('minecraft-server-util');

module.exports = class staffTime {
    constructor(client) {
        this.client = client;

        this.client.staffTime = new Collection();
    }

    async start() {
        setInterval(async () => {
            await this.client.guilds.cache.get('716379843620765837').members.fetch();

            util.queryFull('178.255.219.48', 25565)
                .then(res => {

                    console.log("SERVIDOR ONLINE!")
                    const players = res.players.list || [];

                    const staffs = this.client.guilds.cache.get('716379843620765837').members.cache.filter(m => players.includes(m.nickname || m.user.username) && m.roles.cache.first());

                    staffs.forEach(s => {
                        if (this.client.staffTime.get(s.nickname || s.user.username)) return;

                        this.client.staffTime.set(s.nickname || s.user.username, {
                            start: Date.now(),
                            role: s.roles.hoist?.name || s.roles.cache.first().name,
                            rolePos: s.roles.hoist?.rawPosition || s.roles.cache.first().rawPosition,
                            nickname: s.nickname || s.user.username
                        });

                        this.client.database.ref(`RedeLegit/lastSee/${s.nickname}`).set(Date.now())
                    });

                    this.client.staffTime.forEach(s => {
                        if (players.includes(s.nickname)) return;

                        this.client.staffTime.delete(s.nickname);

                        this.client.database.ref(`RedeLegit/stafftime/${s.nickname}`).transaction(now => (now || 0) + (Date.now() - s.start));
                    })
                }).catch(() => console.log('SERVIDOR OFFLINE!'))
        }, 10000)
    }
}