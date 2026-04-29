const fs = require("fs");
const path = require("path");

const corridasPath = path.join(__dirname, "../data/corridas.json");
const custosPath = path.join(__dirname, "../data/custos.json");

function lerArquivo(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }

  const conteudo = fs.readFileSync(filePath, "utf8");
  return conteudo ? JSON.parse(conteudo) : [];
}

function salvarCorridas(dados) {
  fs.writeFileSync(corridasPath, JSON.stringify(dados, null, 2));
}

// ===============================
// LISTAR
// ===============================
exports.listarCorridas = (req, res) => {
  const corridas = lerArquivo(corridasPath);
  res.json(corridas);
};

// ===============================
// CRIAR
// ===============================
exports.criarCorrida = (req, res) => {
  const corridas = lerArquivo(corridasPath);

  const novaCorrida = {
    id: Date.now(),
    data: req.body.data,
    aplicativo: req.body.aplicativo || "Particular",
    valor: Number(req.body.valor || 0),
    km: Number(req.body.km || 0),

    // 🔥 AGORA EM MINUTOS
    tempo_minutos: Number(req.body.tempo_minutos || 0),

    origem: req.body.origem || "",
    destino: req.body.destino || "",
    forma_pagamento: req.body.forma_pagamento || "",
    observacao: req.body.observacao || ""
  };

  corridas.push(novaCorrida);
  salvarCorridas(corridas);

  res.status(201).json(novaCorrida);
};

// ===============================
// EXCLUIR
// ===============================
exports.excluirCorrida = (req, res) => {
  const corridas = lerArquivo(corridasPath);
  const id = Number(req.params.id);

  const novasCorridas = corridas.filter((c) => c.id !== id);
  salvarCorridas(novasCorridas);

  res.json({ mensagem: "Corrida excluída" });
};

// ===============================
// RESUMO INTELIGENTE
// ===============================
exports.resumoCorridas = (req, res) => {
  const corridas = lerArquivo(corridasPath);
  const custos = lerArquivo(custosPath);

  const faturamento = corridas.reduce((t, c) => t + c.valor, 0);
  const kmTotal = corridas.reduce((t, c) => t + c.km, 0);

  const minutosTotal = corridas.reduce((t, c) => t + (c.tempo_minutos || 0), 0);

  // 🔥 CONVERSÃO PARA HORAS
  const horasTotal = minutosTotal / 60;

  const custosTotais = custos.reduce((t, c) => t + c.valor, 0);

  const lucroReal = faturamento - custosTotais;

  const valorPorKm = kmTotal > 0 ? faturamento / kmTotal : 0;
  const custoPorKm = kmTotal > 0 ? custosTotais / kmTotal : 0;
  const lucroPorKm = kmTotal > 0 ? lucroReal / kmTotal : 0;

  const valorPorHora = horasTotal > 0 ? faturamento / horasTotal : 0;
  const lucroPorHora = horasTotal > 0 ? lucroReal / horasTotal : 0;

  const margem = faturamento > 0 ? (lucroReal / faturamento) * 100 : 0;

  // ===============================
  // ALERTAS INTELIGENTES
  // ===============================
  let status = "Sem dados";
  let alerta = "Cadastre corridas e custos.";

  if (lucroReal > 0) {
    status = "Operação lucrativa";
    alerta = "Você está lucrando. Continue monitorando.";
  }

  if (lucroReal === 0 && faturamento > 0) {
    status = "Empate técnico";
    alerta = "Você faturou, mas não teve lucro.";
  }

  if (lucroReal < 0) {
    status = "Prejuízo";
    alerta = "Você está rodando no prejuízo.";
  }

  if (custoPorKm > 1.8) {
    alerta = "Custo por km alto. Revise combustível e tempo parado.";
  }

  res.json({
    faturamento,
    custos_totais: custosTotais,
    lucro_real: lucroReal,
    km_total: kmTotal,
    minutos_total: minutosTotal,
    horas_total: horasTotal,

    valor_por_km: valorPorKm,
    custo_por_km: custoPorKm,
    lucro_por_km: lucroPorKm,

    valor_por_hora: valorPorHora,
    lucro_por_hora: lucroPorHora,

    margem_lucro: margem,

    status_operacao: status,
    alerta
  });
};