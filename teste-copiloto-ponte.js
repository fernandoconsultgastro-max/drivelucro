// teste-copiloto-ponte.js
// Ponte isolada do copiloto DriveLucro
// Objetivo: receber texto bruto da tela e devolver um objeto pronto para UI/overlay.
// Não altera public/app.js, public/index.html ou public/style.css.

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

  const valores = [...t.matchAll(/R\$\s*([\d.,]+)/gi)].map((m) =>
    Number(m[1].replace(".", "").replace(",", "."))
  );

  const kms = [...t.matchAll(/([\d.,]+)\s*km/gi)].map((m) =>
    Number(m[1].replace(",", "."))
  );

  const minutos = [...t.matchAll(/(\d+)\s*min/gi)].map((m) =>
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
  if ([statusKm, statusHora, statusNota].includes("vermelho")) return "RECUSAR";
  if ([statusKm, statusHora, statusNota].includes("amarelo")) return "ANALISAR";
  return "ACEITAR";
}

function gerarMensagem(decisao, indicadores, dados) {
  const km = indicadores.valorPorKm.toFixed(2);
  const hora = indicadores.valorPorHora.toFixed(2);

  if (decisao === "ACEITAR") {
    return `Boa corrida: R$ ${km}/km e R$ ${hora}/hora.`;
  }

  if (decisao === "ANALISAR") {
    return `Atenção: R$ ${km}/km, R$ ${hora}/hora e nota ${dados.nota}.`;
  }

  return `Corrida fraca: R$ ${km}/km, R$ ${hora}/hora e nota ${dados.nota}.`;
}

function gerarPacoteCopiloto(texto) {
  const dados = extrairDadosBasicos(texto);

  const sucesso =
    dados.valor > 0 &&
    dados.kmTotal > 0 &&
    dados.tempoTotal > 0;

  if (!sucesso) {
    return {
      sucesso: false,
      app: dados.app,
      decisao: "INDEFINIDO",
      mensagem: "Não foi possível extrair valor, km ou tempo da tela.",
      dados
    };
  }

  const indicadores = calcularIndicadores(dados);

  const regras = {
    perfil: "equilibrado",
    metaKm: 2.5,
    metaHora: 50,
    notaMinima: 4.5
  };

  const statusKm = avaliarRegra(indicadores.valorPorKm, regras.metaKm);
  const statusHora = avaliarRegra(indicadores.valorPorHora, regras.metaHora);
  const statusNota = avaliarNota(dados.nota, regras.notaMinima);

  const decisao = decisaoFinal(statusKm, statusHora, statusNota);

  return {
    sucesso: true,
    origem: "leitura_tela_simulada",
    app: dados.app,
    decisao,
    mensagem: gerarMensagem(decisao, indicadores, dados),
    dados,
    indicadores,
    status: {
      km: statusKm,
      hora: statusHora,
      nota: statusNota
    },
    regras
  };
}

// ===============================
// TESTES
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

console.log("PONTE UBER:");
console.log(gerarPacoteCopiloto(chamadaUber));

console.log("\nPONTE 99:");
console.log(gerarPacoteCopiloto(chamada99));

console.log("\nPONTE INDRIVE:");
console.log(gerarPacoteCopiloto(chamadaInDrive));