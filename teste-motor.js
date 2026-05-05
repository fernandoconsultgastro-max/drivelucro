function calcularMotorSemaforo({ valorKm, valorHora, nota }, regras) {
  const pctKm = regras.valorKmMin > 0 ? (valorKm / regras.valorKmMin) * 100 : 100;
  const pctHora = regras.valorHoraMin > 0 ? (valorHora / regras.valorHoraMin) * 100 : 100;
  const pctNota = regras.notaMin > 0 ? (nota / regras.notaMin) * 100 : 100;

  function corGanho(pct) {
    if (pct < 50) return "vermelho";
    if (pct < 100) return "amarelo";
    return "verde";
  }

 function calcularCorNota(pct) {
  if (pct < 80) return "vermelho";
  if (pct < 100) return "amarelo";
  return "verde";
}

  const corKm = corGanho(pctKm);
  const corHora = corGanho(pctHora);
  const corNota = calcularCorNota(pctNota);

  let decisao = "ACEITAR";

  if ([corKm, corHora, corNota].includes("vermelho")) {
    decisao = "RECUSAR";
  } else if ([corKm, corHora, corNota].includes("amarelo")) {
    decisao = "ANALISAR";
  }

  return {
    pctKm: Math.round(pctKm),
    pctHora: Math.round(pctHora),
    pctNota: Math.round(pctNota),
    corKm,
    corHora,
    corNota,
    decisao
  };
}

// ================= TESTES =================

const regras = {
  valorKmMin: 1.5,
  valorHoraMin: 30,
  notaMin: 4.4
};

console.log("=== TESTE ACEITAR ===");
console.log(
  calcularMotorSemaforo(
    { valorKm: 6.67, valorHora: 200, nota: 4.8 },
    regras
  )
);

console.log("=== TESTE ANALISAR ===");
console.log(
  calcularMotorSemaforo(
    { valorKm: 0.8, valorHora: 24, nota: 4.4 },
    regras
  )
);

console.log("=== TESTE RECUSAR ===");
console.log(
  calcularMotorSemaforo(
    { valorKm: 0.5, valorHora: 20, nota: 3.0 },
    regras
  )
);