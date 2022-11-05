const util = require('minecraft-server-util');

module.exports = class MySQLSync {
    constructor(client) {
        this.client = client;

        this.players = [];
    }

    async start() {
        //this.sync();
    }

    async sync() {
        const Util = new this.client.util();

        setInterval(async () => {
            util.queryFull('191.96.225.102', 25565)
                .then(res => {

                    const players = res.players.list || [];

                    const newPlayers = players.filter(p => !this.players.includes(p));

                    newPlayers.forEach(async player => {

                        const ref = await this.client.database.ref(`RedeLegit/sync/${player}`).once('value').then(res => res.val());
                        const userData = await Util.getMysqlInformation2(this.client, `SELECT * FROM galax.accounts WHERE username = '${player}'`);

                        const metadata = await util.getMysqlInformation2()
                    })
                })
        }, 10000)
    }
    // async sync() {
    //     const util = new this.client.utils();

    //     const userdata = await util.getMysqlInformation2(this.client, `SELECT * FROM galax.accounts`);

    //     const metadata = await util.getMysqlInformation2(this.client, `SELECT * FROM galax.metadata_sets`);

    //     const vips = await util.getMysqlInformation2(this.client, `SELECT * FROM galax.group_infos`);

    //     const atualCash = await util.getMysqlInformation2(this.client, `SELECT * FROM commons.cashing`);

    //     const newDataAccounts = [...userdata.map((user, i) => ({
    //         uuid: user.unique_id,
    //         username: user.username,
    //         id: i + 1,
    //         group_name: metadata
    //     }))];

    //     const newDataCash = [...userdata.map(user => ({

    //     }))]
    // }
}