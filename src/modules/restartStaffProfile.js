module.exports = class restartStaffProfile {
    constructor(client) {
        this.client = client;
    }

    async start() {
        const { schedule } = require('node-cron');

        schedule('0 0 * * 0', async () => {
            this.client.database.ref(`RedeLegit/Punishs`).remove();

            this.client.database.ref(`RedeLegit/stafftime/`).remove();

            this.client.database.ref(`RedeLegit/lastSee/`).remove();
        }, {
            timezone: 'America/Sao_Paulo'
        })
    }
}