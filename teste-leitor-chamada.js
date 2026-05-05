// ===============================
// TESTE — MODELO UNIVERSAL DE CHAMADA
// ===============================

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
  const kmTotal =
    normalizarNumero(kmAtePassageiro) + normalizarNumero(kmViagem);

  const tempoTotal =
    normalizarNumero(tempoAtePassageiro) + normalizarNumero(tempoViagem);

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

// ===============================
// TESTES
// ===============================

const uber = criarChamadaUniversal({
  app: "Uber",
  valor: "7,04",
  kmAtePassageiro: "1,0",
  kmViagem: "3,4",
  tempoAtePassageiro: "3",
  tempoViagem: "6",
  nota: "4,8",
  origemTexto: "Exemplo Uber"
});

const noventaENove = criarChamadaUniversal({
  app: "99",
  valor: "18,50",
  kmAtePassageiro: "0",
  kmViagem: "8,2",
  tempoAtePassageiro: "0",
  tempoViagem: "22",
  nota: "4,7",
  origemTexto: "Exemplo 99"
});

const inDrive = criarChamadaUniversal({
  app: "inDrive",
  valor: "25",
  kmAtePassageiro: "2",
  kmViagem: "10",
  tempoAtePassageiro: "5",
  tempoViagem: "25",
  nota: "5,0",
  origemTexto: "Exemplo inDrive"
});

console.log("=== UBER ===");
console.log(uber);

console.log("=== 99 ===");
console.log(noventaENove);

console.log("=== INDRIVE ===");
console.log(inDrive);