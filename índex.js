import 'dotenv/config';
import { Client, GatewayIntentBits, AttachmentBuilder, SlashCommandBuilder, REST, Routes } from 'discord.js';
import pixPayload from 'pix-payload';
import QRCode from 'qrcode';

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const PIX_CHAVE = process.env.PIX_CHAVE;
const RECEBEDOR_NOME = process.env.RECEBEDOR_NOME || 'Minha Loja';
const RECEBEDOR_CIDADE = process.env.RECEBEDOR_CIDADE || 'Cidade';

const commands = [
  new SlashCommandBuilder()
    .setName('comprar')
    .setDescription('Gerar PIX com QR code')
    .addStringOption(opt => opt.setName('produto').setDescription('Nome do produto').setRequired(true))
    .addNumberOption(opt => opt.setName('valor').setDescription('Valor em reais (ex: 49.90)').setRequired(true))
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    console.log('Registrando comando /comprar...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('Comando registrado com sucesso.');
  } catch (err) {
    console.error(err);
  }
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'comprar') {
    const produto = interaction.options.getString('produto');
    const valor = interaction.options.getNumber('valor');
    await interaction.deferReply();

    try {
      const payload = pixPayload({
        key: PIX_CHAVE,
        description: `Compra: ${produto}`,
        merchantName: RECEBEDOR_NOME,
        merchantCity: RECEBEDOR_CIDADE,
        amount: valor.toFixed(2),
        txid: `TX${Date.now().toString().slice(-8)}`
      });

      const qrBuffer = await QRCode.toBuffer(payload);
      const attachment = new AttachmentBuilder(qrBuffer, { name: 'pix.png' });

      const replyText = 
        `🛒 **Produto:** ${produto}\n💵 **Valor:** R$ ${valor.toFixed(2)}\n🔑 **Chave PIX:** \`${PIX_CHAVE}\`\n🆔 **TXID:** \`${payload.txid || '—'}\`\n\n📲 **Copie e cole o código PIX abaixo:**\n\`\`\`\n${payload}\n\`\`\``;

      await interaction.editReply({ content: replyText, files: [attachment] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Erro ao gerar PIX. Tente novamente.');
    }
  }
});

client.login(TOKEN);
