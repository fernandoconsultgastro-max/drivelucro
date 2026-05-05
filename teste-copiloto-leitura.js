// teste-copiloto-leitura.js
// Camada isolada para simular leitura de tela dos apps Uber, 99 e inDrive
// Não altera o PWA, não mexe no simulador e não roda na Vercel.

function normalizarTextoTela(texto) {
  return String(texto || "")
    .replace(/\s+/g, " ")
    .trim();
}

function detectarAplicativo(texto) {
  const t = normalizarTextoTela(texto).toLowerCase();

  if (t.includes("uber")) return "uber";
  if (t.includes("99") || t.includes("99pop")) return "99";
  if (t.includes("indrive") || t.includes("in drive")) return "indrive";

  return "desconhecido";
}

function extrairDadosBasicos(texto) {
  const t = normalizarTextoTela(texto);

  const valores = [...t.matchAll(/R\$\s*([\d.,]+)/gi)].map(m =>
    Number(m[1].replace(".", "").replace(",", "."))
  );

  const kms = [...t.matchAll(/([\d.,]+)\s*km/gi)].map(m =>
    Number(m[1].replace(",", "."))
  );

  const minutos = [...t.matchAll(/(\d+)\s*min/gi)].map(m =>
    Number(m[1])
  );

  const notaMatch = t.match(/([\d.,]+)\s*★/);

  return {
    app: detectarAplicativo(t),
    valor: valores[0] || 0,
    kmTotal: kms.reduce((acc, n) => acc + n, 0),
    tempoTotal: minutos.reduce((acc, n) => acc + n, 0),
    nota: notaMatch ? Number(notaMatch[1].replace(",", ".")) : 0,
    textoOriginal: texto
  };
}

function analisarTela(texto) {
  const dados = extrairDadosBasicos(texto);

  return {
    sucesso: dados.valor > 0 && dados.kmTotal > 0 && dados.tempoTotal > 0,
    dados
  };
}

// ===============================
// MOTOR DE DECISÃO (ISOLADO)
// ===============================

function calcularIndicadores(dados) {
  const valorPorKm = dados.kmTotal > 0 ? dados.valor / dados.kmTotal : 0;
  const valorPorHora = dados.tempoTotal > 0 ? (dados.valor / dados.tempoTotal) * 60 : 0;

  return {
    valorPorKm,
    valorPorHora
  };
}

function avaliarRegra(valor, meta) {
  if (valor >= meta) return "verde";
  if (valor >= meta * 0.5) return "amarelo";
  return "vermelho";
}

function avaliarNota(nota, notaMinima) {
  if (nota >= notaMinima) return "verde";
  if (nota >= notaMinima * 0.8) return "amarelo";
  return "vermelho";
}

function decisaoFinal(statusKm, statusHora, statusNota) {
  if ([statusKm, statusHora, statusNota].includes("vermelho")) {
    return "RECUSAR";
  }

  if ([statusKm, statusHora, statusNota].includes("amarelo")) {
    return "ANALISAR";
  }

  return "ACEITAR";
}

function rodarCopiloto(texto) {
  const analise = analisarTela(texto);

  if (!analise.sucesso) {
    return { erro: "Não foi possível extrair dados válidos" };
  }

  const dados = analise.dados;
  const indicadores = calcularIndicadores(dados);

  // metas padrão (equilibrado)
  const metaKm = 2.5;
  const metaHora = 50;
  const notaMinima = 4.5;

  const statusKm = avaliarRegra(indicadores.valorPorKm, metaKm);
  const statusHora = avaliarRegra(indicadores.valorPorHora, metaHora);
  const statusNota = avaliarNota(dados.nota, notaMinima);

  const decisao = decisaoFinal(statusKm, statusHora, statusNota);

  return {
    ...dados,
    ...indicadores,
    statusKm,
    statusHora,
    statusNota,
    decisao
  };
}

// ===============================
// TESTES ISOLADOS
// ===============================

const chamadaUber = `
Uber
R$ 10
5 min
4 km
25 min
16 km
3.0 ★
`;

const chamada99 = `
99
R$ 32,50
12 km
28 min
4.9 ★
`;

const chamadaInDrive = `
inDrive

R$ 45
18 km
35 min
4.8 ★
`;

console.log("TESTE UBER:");
console.log(rodarCopiloto(chamadaUber));

console.log("\nTESTE 99:");
console.log(rodarCopiloto(chamada99));

console.log("\nTESTE INDRIVE:");
console.log(rodarCopiloto(chamadaInDrive));