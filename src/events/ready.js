module.exports = class readyEvent {
	constructor(client) {
		this.client = client;
	}

	async run(data) {

		this.client.music.init(this.client.user.id);

		setInterval(async () => {
			const principalServer = this.client.guilds.cache.get(process.env.PRINCIPAL_SERVER);

			const allServers = this.client.guilds.cache.map(s => s).filter(s => s.id !== process.env.PRINCIPAL_SERVER);

			const equipeServer = this.client.guilds.cache.get('716379843620765837');

			const allowedMembers = principalServer.members.cache.filter(c => equipeServer.members.cache.has(c.id)).map(m => m);

			for (const server of allServers) {
				for (const member of allowedMembers) {

					const m = server.members.cache.get(member.id);

					if (!m) continue;

					if (m.nickname !== member.nickname) m.setNickname(member.nickname, 'Sincronização automática de Nickname.').catch(() => false);

					const oldMemberRolesName = member.roles.cache.map(r => r.name);

					const oldMemberRoles = server.roles.cache.filter(r => oldMemberRolesName.includes(r.name)).filter(r => r && r.hoist);

					const rolesToRemove = m.roles.cache.filter(r => !oldMemberRoles.has(r.id)).filter(r => r && r.hoist)

					const rolesToAdd = oldMemberRoles.filter(r => !m.roles.cache.has(r.id));

					if (rolesToRemove.size) await m.roles.remove(rolesToRemove, 'Sincronização automática de cargos.').catch(() => false);

					if (rolesToAdd.size) await m.roles.add(rolesToAdd, 'Sincronização automática de cargos.').catch(() => false);
				}
			}
		}, 10000)
	}
}