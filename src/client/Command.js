module.exports = class Command {
    constructor(client, options) {
        this.client = client;

        this.name = options.name;

        this.description = options.description;

        this.devsOnly = options.devsOnly || false;

        this.permissions = options.permissions || [];

        this.required_roles = options.required_roles || [];

        this.options = options.options || [];

        this.equipeRoles = {
            'estagiário': '1041826494181290064',
            'ajudante': '876897405063270420',
            'ajudantes': '876897405063270420',
            'moderador': '876896736201801759',
            'administrador': '876896342818062406',
            'gerente': '876895549528350771',
            'diretor': '706272903104168018'
        };
    }

    verifyRequeriments(interaction) {
        if (this.devsOnly && !process.env.devs.includes(interaction.user.id)) return interaction.reply({
            content: `Você precisa do cargo **desenvolvedor** ou superior para utilizar este comando.`,
            ephemeral: true
        });

        if (this.required_roles.length) {

            const roles = {
                'estagiário': '1041753469805142136',
                'ajudante': '876897405063270420',
                'moderador': '876896736201801759',
                'administrador': '876896342818062406',
                'gerente': '876895549528350771',
                'diretor': '706272903104168018'
            }

            const guild = this.client.guilds.cache.get('564398372161585162');

            const role = guild.roles.cache.get(roles[this.required_roles[0]]);

            const allowedRoles = guild.roles.cache.filter(r => r.comparePositionTo(role) >= 0);

            if (!guild.members.cache.get(interaction.user.id).roles.cache.find(r => allowedRoles.has(r.id))) return interaction.reply({
                content: `Você precisa do cargo \`${role.name.toUpperCase()}\` ou superior para utilizar este comando.`,
                ephemeral: true
            })
        }

        return false;
    }

    checkRoles(interaction, roleName) {
        if (interaction) {
            const roles = {
                'estagiário': '1041753469805142136',
                'ajudante': '876897405063270420',
                'moderador': '876896736201801759',
                'administrador': '876896342818062406',
                'gerente': '876895549528350771',
                'diretor': '706272903104168018'
            }

            const guild = this.client.guilds.cache.get('564398372161585162');

            const role = guild.roles.cache.get(roles[roleName]);

            const allowedRoles = guild.roles.cache.filter(r => r.comparePositionTo(role) >= 0);

            if (!guild.members.cache.get(interaction.user.id).roles.cache.find(r => allowedRoles.has(r.id))) return true;

            return false;
        }
    }

    async isStaff(userId) {
        return this.client.guilds.cache.get(process.env.STAFF_SERVER).members.cache.has(userId)
    }
}