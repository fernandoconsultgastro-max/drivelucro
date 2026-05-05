function normalizarNumero(valor) {
  if (!valor) return 0;

  let texto = String(valor)
    .replace("R$", "")
    .replace(/\s/g, "")
    .trim();

  if (texto.includes(".") && texto.includes(",")) {
    texto = texto.replace(/\./g, "").replace(",", ".");
  } else if (texto.includes(",")) {
    texto = texto.replace(",", ".");
  }

  return Number(texto);
}

function criarChamadaUniversal(dados) {
  const kmAtePassageiro = normalizarNumero(dados.kmAtePassageiro);
  const kmViagem = normalizarNumero(dados.kmViagem);
  const tempoAtePassageiro = normalizarNumero(dados.tempoAtePassageiro);
  const tempoViagem = normalizarNumero(dados.tempoViagem);

  return {
    app: "Uber",
    valor: normalizarNumero(dados.valor),
    kmAtePassageiro,
    kmViagem,
    kmTotal: kmAtePassageiro + kmViagem,
    tempoAtePassageiro,
    tempoViagem,
    tempoTotal: tempoAtePassageiro + tempoViagem,
    nota: normalizarNumero(dados.nota || 5),
    origemTexto: dados.origemTexto || ""
  };
}

function parseUber(texto) {
  const origemTexto = String(texto || "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const valorMatch =
    origemTexto.match(/R\$\s*(\d+[.,]?\d*)/i) ||
    origemTexto.match(/valor\s*:?\s*(\d+[.,]?\d*)/i);

  const tempos = [...origemTexto.matchAll(/(\d+[.,]?\d*)\s*min/gi)].map(m => m[1]);
  const kms = [...origemTexto.matchAll(/(\d+[.,]?\d*)\s*km/gi)].map(m => m[1]);

  const notaMatch =
    origemTexto.match(/(\d+[.,]?\d*)\s*★/i) ||
    origemTexto.match(/nota\s*:?\s*(\d+[.,]?\d*)/i);

  return criarChamadaUniversal({
    valor: valorMatch ? valorMatch[1] : 0,
    tempoAtePassageiro: tempos[0] || 0,
    tempoViagem: tempos[1] || 0,
    kmAtePassageiro: kms[0] || 0,
    kmViagem: kms[1] || 0,
    nota: notaMatch ? notaMatch[1] : 5,
    origemTexto
  });
}

const testes = [
  `R$ 7,04
   3 min
   1,0 km
   6 min
   3,4 km
   4.8 ★`,

  `R$7.04 3min 1km 6min 3.4km nota 4,8`,

  `Valor: 12,50
   2 min
   0,8 km
   14 min
   6,2 km
   nota: 4.7`,

  `R$ 30
   5min
   2km
   20min
   10km
   5,0 ★`
];

testes.forEach((texto, index) => {
  console.log(`\n=== TESTE UBER ${index + 1} ===`);
  console.log(parseUber(texto));
});