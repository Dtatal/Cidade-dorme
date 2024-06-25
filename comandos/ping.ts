import Comando from "../utils/comando";

const delay = 500
const ping = ":ping_pong: Ping :black_small_square:"
const pong = ":black_small_square: Pong :ping_pong:"

export default Comando({
  detalhes: {
    descrição: "Ping!",
    args: []
  },
  fn: async (interaction) => {
    const msg = await interaction.reply({
      embeds: [
        {
          title: ping,
          description: `Testando latência...
          Testando latência da API.`,
          color: 0x00FF00
        }
      ],
      fetchReply: true
    })
    let dot = '..'
    let tries = 1;
    const pings: [number, number][] = [[msg.createdTimestamp, interaction.createdTimestamp]]
    while (interaction.client.ws.ping === -1 || tries <= 5) {
      const avg_ping = pings.map(([last, past]) => last - past).reduce((a, b) => a + b) / pings.length
      let description = `Latência: ${avg_ping.toFixed(0)}ms`
      if (interaction.client.ws.ping !== -1) {
        description += `
          Latência da API: ${interaction.client.ws.ping}ms
          Finalizando teste de latência${dot}`
      }
      else {
        description += `
          Testando latência da API${dot}`
      }
      const reply = await interaction.editReply({
        embeds: [
          {
            title: tries % 2 === 0 ? ping : pong,
            description,
            color: 0x00FF00
          }
        ],
      })
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      pings.push([reply.editedTimestamp! - (delay * tries++), pings[pings.length - 1][0]])
      dot += '.'
      if (dot.length > 3) dot = '.'
      await new Promise((r) => setTimeout(r, delay))
    }
    const avg_ping = pings.map(([last, past]) => last - past).reduce((a, b) => a + b) / pings.length
    await interaction.editReply({
      embeds: [
        {
          title: tries % 2 === 0 ? ping.replace(":black_small_square:", "") : pong.replace(":black_small_square:", ""),
          description: `Latência: ${avg_ping.toFixed(0)}ms
            Latência da API: ${interaction.client.ws.ping}ms`,
          color: 0x00FF00
        }
      ]
    })
  }
})