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

function criarChamadaUniversal({
  app = "",
  valor = 0,
  kmAtePassageiro = 0,
  kmViagem = 0,
  tempoAtePassageiro = 0,
  tempoViagem = 0,
  nota = 5,
  origemTexto = ""
}) {
  const kmTotal = normalizarNumero(kmAtePassageiro) + normalizarNumero(kmViagem);
  const tempoTotal = normalizarNumero(tempoAtePassageiro) + normalizarNumero(tempoViagem);

  return {
    app,
    valor: normalizarNumero(valor),
    kmAtePassageiro: normalizarNumero(kmAtePassageiro),
    kmViagem: normalizarNumero(kmViagem),
    kmTotal,
    tempoAtePassageiro: normalizarNumero(tempoAtePassageiro),
    tempoViagem: normalizarNumero(tempoViagem),
    tempoTotal,
    nota: normalizarNumero(nota),
    origemTexto
  };
}

function parseUber(texto) {
  const origemTexto = String(texto || "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const valorMatch = origemTexto.match(/R\$\s?(\d+[.,]?\d*)/i);
  const tempos = [...origemTexto.matchAll(/(\d+[.,]?\d*)\s*min/gi)].map(m => m[1]);
  const kms = [...origemTexto.matchAll(/(\d+[.,]?\d*)\s*km/gi)].map(m => m[1]);
  const notaMatch =
    origemTexto.match(/(\d+[.,]?\d*)\s*★/i) ||
    origemTexto.match(/nota\s*:?\s*(\d+[.,]?\d*)/i);

  return criarChamadaUniversal({
    app: "Uber",
    valor: valorMatch ? valorMatch[1] : 0,
    tempoAtePassageiro: tempos[0] || 0,
    tempoViagem: tempos[1] || 0,
    kmAtePassageiro: kms[0] || 0,
    kmViagem: kms[1] || 0,
    nota: notaMatch ? notaMatch[1] : 5,
    origemTexto
  });
}

// ===============================
// TESTE
// ===============================
const textoUber = `
R$ 7,04
3 min
1,0 km
6 min
3,4 km
4.8 ★
`;

console.log("=== PARSER UBER ===");
console.log(parseUber(textoUber));