module.exports = class interactionCreateEvent {
    constructor(client) {
        this.client = client;
    }

    async run(interaction) {
        if (!interaction.isCommand()) return;

        //if (!['716379843620765837', '657008822912679936'].includes(interaction.guild.id)) return interaction.reply({
        //    content: 'Ops! Os comandos ainda não estão disponíveis para serem utilizados neste servidor.',
        //    ephemeral: true
        //});

        const cmd = this.client.commands.get(interaction.commandName);

        const verify = cmd.verifyRequeriments(interaction);

        if (verify) return;

        const player = this.client.music.players.get(interaction.guild.id);

        cmd.run({ message: interaction, player });
    }
}