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
                        const userData = await Util.getMysqlInformation(this.client, `SELECT * FROM galax.accounts WHERE username = '${player}'`);

                        if (!userData) return;

                        const metadata = await Util.getMysqlInformation(this.client, `SELECT * FROM galax.metadata WHERE name = '${player}'`);

                        const vip = await Util.getMysqlInformation(this.client, `SELECT * FROM galax.group_infos WHERE user = '${userData[0].unique_id}'`);

                        const newUserData = {
                            uuid: userData.unique_id,
                            username: userData.username,
                            group_name: metadata.current_group
                        };

                        const update = await Util.getMysqlInformation2(this.client, `UPDATE commons.accounts SET uuid = '${newUserData[0].uuid}', username = '${newUserData[0].username}', group_name = '${newUserData[0].group_name}' WHERE username = '${player}'`);
                        if (update === 'noFound') await Util.getMysqlInformation2(this.client, `INSERT INTO commons.accounts (uuid, username, group_name) VALUES ('${newUserData[0].uuid}', '${newUserData[0].username}', '${newUserData[0].group_name}')`);

                        if (userData.cash > 0) await Util.getMysqlInformation2(this.client, `UPDATE commons.cashing SET cash = '${userData[0].cash}' WHERE username = '${player}'`);
                        if (userData.cash > 0) await Util.getMysqlInformation2(this.client, `UPDATE galax.accounts SET cash = '0' WHERE username = '${player}'`);

                        if (vip !== "noFound") await Util.getMysqlInformation2(this.client, `UPDATE commons.vips_info SET vip_name = '${vip[0].role}', current_vip = '${vip[0].role}', expire_at = '${String(vip[0].expire_at).split(" ")[0]}' WHERE username = '${player}'`);
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