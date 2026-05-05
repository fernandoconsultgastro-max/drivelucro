// teste-copiloto-overlay.js
// Simulação visual do overlay do copiloto no terminal.
// Não altera o PWA.

function corDecisao(decisao) {
  if (decisao === "ACEITAR") return "🟢";
  if (decisao === "ANALISAR") return "🟡";
  if (decisao === "RECUSAR") return "🔴";
  return "⚪";
}

function renderizarOverlayCopiloto(pacote) {
  console.log("\n==============================");
  console.log(" DRIVELUCRO COPILOTO");
  console.log("==============================");

  console.log(`${corDecisao(pacote.decisao)} DECISÃO: ${pacote.decisao}`);
  console.log(`App: ${pacote.app}`);
  console.log(`Mensagem: ${pacote.mensagem}`);

  if (!pacote.sucesso) {
    console.log("==============================\n");
    return;
  }

  console.log("------------------------------");
  console.log(`Valor: R$ ${pacote.dados.valor.toFixed(2)}`);
  console.log(`Tempo: ${pacote.dados.tempoTotal} min`);
  console.log(`Km: ${pacote.dados.kmTotal.toFixed(1)} km`);
  console.log(`Nota: ${pacote.dados.nota}`);

  console.log("------------------------------");
  console.log(`R$/km: ${pacote.indicadores.valorPorKm.toFixed(2)} | ${pacote.status.km}`);
  console.log(`R$/hora: ${pacote.indicadores.valorPorHora.toFixed(2)} | ${pacote.status.hora}`);
  console.log(`Nota: ${pacote.status.nota}`);

  console.log("==============================\n");
}

// Pacotes simulados vindos da ponte
const pacoteUber = {
  sucesso: true,
  app: "uber",
  decisao: "RECUSAR",
  mensagem: "Corrida fraca: R$ 0.50/km, R$ 20.00/hora e nota 3.",
  dados: {
    valor: 10,
    tempoTotal: 30,
    kmTotal: 20,
    nota: 3
  },
  indicadores: {
    valorPorKm: 0.5,
    valorPorHora: 20
  },
  status: {
    km: "vermelho",
    hora: "vermelho",
    nota: "vermelho"
  }
};

const pacote99 = {
  sucesso: true,
  app: "99",
  decisao: "ANALISAR",
  mensagem: "Atenção: R$ 2.71/km, R$ 69.64/hora e nota 4.2.",
  dados: {
    valor: 32.5,
    tempoTotal: 28,
    kmTotal: 12,
    nota: 4.2
  },
  indicadores: {
    valorPorKm: 2.708,
    valorPorHora: 69.64
  },
  status: {
    km: "verde",
    hora: "verde",
    nota: "amarelo"
  }
};

renderizarOverlayCopiloto(pacoteUber);
renderizarOverlayCopiloto(pacote99);