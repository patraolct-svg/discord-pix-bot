const payload = pixPayload({
  key: PIX_CHAVE,
  description: `Compra: ${produto}`,
  // merchantName: RECEBEDOR_NOME, // Removido
  // merchantCity: RECEBEDOR_CIDADE, // Removido
  amount: valor.toFixed(2),
  txid: `TX${Date.now().toString().slice(-8)}`
});
