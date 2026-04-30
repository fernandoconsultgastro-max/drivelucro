// =====================================================
// DRIVELUCRO — APP.JS
// VERSÃO CORRIGIDA — BLOCOS 16, 17, 18B, 19
// =====================================================

let corridas = JSON.parse(localStorage.getItem("corridas")) || [];
let custos = JSON.parse(localStorage.getItem("custos")) || [];

const META_DIARIA = 300;
let periodoAtual = "mes";
let dataSelecionada = new Date();
let historicoChamadas = JSON.parse(localStorage.getItem("historicoChamadas")) || [];
let historicoVeiculo = JSON.parse(localStorage.getItem("historicoVeiculo")) || [];

let dadosVeiculo = JSON.parse(localStorage.getItem("dadosVeiculo")) || {
  custosFixos: 0,
  kmMensal: 0,
  combustivel: "Gasolina",
  valorAbastecido: 0,
  litros: 0,
  kmRodado: 0,
  custoKmReal: 0
};

// ===============================
// BLOCO 28.1 — CADASTRO FIXO DO VEÍCULO
// ===============================
const cadastroVeiculoSalvo = JSON.parse(localStorage.getItem("cadastroVeiculoFixo"));

if (cadastroVeiculoSalvo) {
  dadosVeiculo = {
    ...dadosVeiculo,
    ...cadastroVeiculoSalvo
  };
}

let regras = JSON.parse(localStorage.getItem("regras")) || {
  valorKmMin: 1.6,
  valorHoraMin: 35,
  kmMax: 25,
  notaMin: 4.1,
  custoKmPadrao: 1.55
};

// ===============================
// UTILITÁRIOS
// ===============================
function numeroBR(valor) {
  if (!valor) return 0;

  return Number(
    String(valor)
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(".", "")
      .replace(",", ".")
  );
}

function moeda(v) {
  return Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function dataHoje() {
  return new Date().toLocaleDateString("pt-BR");
}

function formatarDataInput(dataISO) {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarDataISO(date) {
  return date.toISOString().split("T")[0];
}

function atualizarInputData() {
  const input = pegarElemento("data-selecionada");
  if (!input) return;

  input.value = formatarDataISO(dataSelecionada);
}

function salvar() {
  localStorage.setItem("corridas", JSON.stringify(corridas));
  localStorage.setItem("custos", JSON.stringify(custos));
}

function pegarElemento(id) {
  return document.getElementById(id);
}

// ===============================
// BLOCO 36.1 — GARRA DO CADASTRO FIXO DO VEÍCULO
// MANUTENÇÃO: salva automaticamente qualquer alteração
// nos campos do veículo, sem depender apenas do botão calcular.
// ===============================
function salvarCadastroVeiculoFixo() {
  const cadastro = {
    parcela: numeroBR(pegarElemento("veiculo-parcela")?.value),
    seguro: numeroBR(pegarElemento("veiculo-seguro")?.value),
    ipva: numeroBR(pegarElemento("veiculo-ipva")?.value),
    manutencao: numeroBR(pegarElemento("veiculo-manutencao")?.value),
    oleo: numeroBR(pegarElemento("veiculo-oleo")?.value),
    pneus: numeroBR(pegarElemento("veiculo-pneus")?.value),
    lavagem: numeroBR(pegarElemento("veiculo-lavagem")?.value),
    telefone: numeroBR(pegarElemento("veiculo-telefone")?.value),
    outros: numeroBR(pegarElemento("veiculo-outros")?.value),
    kmMensal: numeroBR(pegarElemento("veiculo-km-mensal")?.value),

    combustivelPadrao: pegarElemento("veiculo-combustivel-padrao")?.value || "gasolina",
    precoGasolina: numeroBR(pegarElemento("veiculo-preco-gasolina")?.value),
    consumoGasolina: numeroBR(pegarElemento("veiculo-consumo-gasolina")?.value),
    precoEtanol: numeroBR(pegarElemento("veiculo-preco-etanol")?.value),
    consumoEtanol: numeroBR(pegarElemento("veiculo-consumo-etanol")?.value),

    custosFixos: dadosVeiculo.custosFixos || 0,
    custoFixoKm: dadosVeiculo.custoFixoKm || 0,
    custoCombustivelKm: dadosVeiculo.custoCombustivelKm || 0,
    custoKmReal: dadosVeiculo.custoKmReal || 0
  };

  dadosVeiculo = {
    ...dadosVeiculo,
    ...cadastro
  };

  localStorage.setItem("dadosVeiculo", JSON.stringify(dadosVeiculo));
  localStorage.setItem("cadastroVeiculoFixo", JSON.stringify(dadosVeiculo));
}

function configurarAutoSaveVeiculo() {
  const ids = [
    "veiculo-parcela",
    "veiculo-seguro",
    "veiculo-ipva",
    "veiculo-manutencao",
    "veiculo-oleo",
    "veiculo-pneus",
    "veiculo-lavagem",
    "veiculo-telefone",
    "veiculo-outros",
    "veiculo-km-mensal",
    "veiculo-combustivel-padrao",
    "veiculo-preco-gasolina",
    "veiculo-consumo-gasolina",
    "veiculo-preco-etanol",
    "veiculo-consumo-etanol"
  ];

  ids.forEach(id => {
    const campo = pegarElemento(id);
    if (!campo) return;

    campo.addEventListener("input", salvarCadastroVeiculoFixo);
    campo.addEventListener("change", salvarCadastroVeiculoFixo);
  });
}
// ===============================
// BLOCO 36 — CARREGAR CADASTRO FIXO DO VEÍCULO
// ===============================
function carregarDadosVeiculoNaTela() {
  const cadastroFixo = JSON.parse(localStorage.getItem("cadastroVeiculoFixo"));
  const dadosSalvos = JSON.parse(localStorage.getItem("dadosVeiculo"));
  const cadastro = cadastroFixo || dadosSalvos || dadosVeiculo || {};

  dadosVeiculo = {
    ...dadosVeiculo,
    ...cadastro
  };

  const campos = {
    "veiculo-parcela": "parcela",
    "veiculo-seguro": "seguro",
    "veiculo-ipva": "ipva",
    "veiculo-manutencao": "manutencao",
    "veiculo-oleo": "oleo",
    "veiculo-pneus": "pneus",
    "veiculo-lavagem": "lavagem",
    "veiculo-telefone": "telefone",
    "veiculo-outros": "outros",
    "veiculo-km-mensal": "kmMensal",
    "veiculo-preco-gasolina": "precoGasolina",
    "veiculo-consumo-gasolina": "consumoGasolina",
    "veiculo-preco-etanol": "precoEtanol",
    "veiculo-consumo-etanol": "consumoEtanol"
  };

  Object.keys(campos).forEach(id => {
    const el = pegarElemento(id);
    if (!el) return;

    const valor = dadosVeiculo[campos[id]];
    el.value = valor ? String(valor).replace(".", ",") : "";
  });

  const combustivelPadrao = pegarElemento("veiculo-combustivel-padrao");
  if (combustivelPadrao && dadosVeiculo.combustivelPadrao) {
    combustivelPadrao.value = dadosVeiculo.combustivelPadrao;
  }

  const resultado = pegarElemento("resultado-custo-veiculo");
  if (resultado) {
    resultado.textContent = dadosVeiculo.custoKmReal > 0
      ? `Custo total/km: ${moeda(dadosVeiculo.custoKmReal)}`
      : "Custo total/km: R$ 0,00";
  }
}

function converterDataBR(dataBR) {
  if (!dataBR) return new Date();

  const partes = dataBR.split("/");
  const dia = Number(partes[0]);
  const mes = Number(partes[1]) - 1;
  const ano = Number(partes[2]);

  return new Date(ano, mes, dia);
}

function mesmoDia(data) {
  const d = converterDataBR(data);

  return (
    d.getDate() === dataSelecionada.getDate() &&
    d.getMonth() === dataSelecionada.getMonth() &&
    d.getFullYear() === dataSelecionada.getFullYear()
  );
}

function mesmaSemana(data) {
  const d = converterDataBR(data);

  const inicioSemana = new Date(dataSelecionada);
  inicioSemana.setDate(dataSelecionada.getDate() - dataSelecionada.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  return d >= inicioSemana && d <= fimSemana;
}

function mesmoMes(data) {
  const d = converterDataBR(data);

  return (
    d.getMonth() === dataSelecionada.getMonth() &&
    d.getFullYear() === dataSelecionada.getFullYear()
  );
}

function mesmoAno(data) {
  const d = converterDataBR(data);

  return d.getFullYear() === dataSelecionada.getFullYear();
}

function filtrarPorPeriodo(lista) {
  if (periodoAtual === "dia") {
    return lista.filter(item => mesmoDia(item.data));
  }

  if (periodoAtual === "semana") {
    return lista.filter(item => mesmaSemana(item.data));
  }

  if (periodoAtual === "mes") {
    return lista.filter(item => mesmoMes(item.data));
  }

  if (periodoAtual === "ano") {
    return lista.filter(item => mesmoAno(item.data));
  }

  return lista;
}

function metaDoPeriodo() {
  if (periodoAtual === "dia") return META_DIARIA;
  if (periodoAtual === "semana") return META_DIARIA * 7;
  if (periodoAtual === "mes") return META_DIARIA * 30;
  if (periodoAtual === "ano") return META_DIARIA * 365;

  return META_DIARIA;
}


// ===============================
// BLOCO 29 — CUSTO REAL DO VEÍCULO
// MANUTENÇÃO: calcula custo fixo/km + combustível/km.
// ===============================
function configurarCustoVeiculo() {
  const parcela = pegarElemento("veiculo-parcela");
  const seguro = pegarElemento("veiculo-seguro");
  const ipva = pegarElemento("veiculo-ipva");
  const manutencao = pegarElemento("veiculo-manutencao");
  const oleo = pegarElemento("veiculo-oleo");
  const pneus = pegarElemento("veiculo-pneus");
  const lavagem = pegarElemento("veiculo-lavagem");
  const telefone = pegarElemento("veiculo-telefone");
  const outros = pegarElemento("veiculo-outros");
  const kmMensal = pegarElemento("veiculo-km-mensal");

  const combustivelPadrao = pegarElemento("veiculo-combustivel-padrao");
  const precoGasolina = pegarElemento("veiculo-preco-gasolina");
  const consumoGasolina = pegarElemento("veiculo-consumo-gasolina");
  const precoEtanol = pegarElemento("veiculo-preco-etanol");
  const consumoEtanol = pegarElemento("veiculo-consumo-etanol");

  const botao = pegarElemento("btn-calcular-custo-veiculo");
  const resultado = pegarElemento("resultado-custo-veiculo");

  if (!botao) return;

  botao.addEventListener("click", () => {
    const totalFixos =
      numeroBR(parcela?.value) +
      numeroBR(seguro?.value) +
      numeroBR(ipva?.value) +
      numeroBR(manutencao?.value) +
      numeroBR(oleo?.value) +
      numeroBR(pneus?.value) +
      numeroBR(lavagem?.value) +
      numeroBR(telefone?.value) +
      numeroBR(outros?.value);

    const kmMensalValor = numeroBR(kmMensal?.value);

    const precoGasolinaValor = numeroBR(precoGasolina?.value);
    const consumoGasolinaValor = numeroBR(consumoGasolina?.value);
    const precoEtanolValor = numeroBR(precoEtanol?.value);
    const consumoEtanolValor = numeroBR(consumoEtanol?.value);

    const tipoCombustivel = combustivelPadrao?.value || "gasolina";

    if (!kmMensalValor) {
      alert("Preencha o km médio mensal.");
      return;
    }

    if (tipoCombustivel === "gasolina" && (!precoGasolinaValor || !consumoGasolinaValor)) {
      alert("Preencha preço e consumo da gasolina.");
      return;
    }

    if (tipoCombustivel === "etanol" && (!precoEtanolValor || !consumoEtanolValor)) {
      alert("Preencha preço e consumo do etanol.");
      return;
    }

    const custoFixoKm = totalFixos / kmMensalValor;

    const custoCombustivelKm =
      tipoCombustivel === "gasolina"
        ? precoGasolinaValor / consumoGasolinaValor
        : precoEtanolValor / consumoEtanolValor;

    const custoTotalKm = custoFixoKm + custoCombustivelKm;

    dadosVeiculo.parcela = numeroBR(parcela?.value);
    dadosVeiculo.seguro = numeroBR(seguro?.value);
    dadosVeiculo.ipva = numeroBR(ipva?.value);
    dadosVeiculo.manutencao = numeroBR(manutencao?.value);
    dadosVeiculo.oleo = numeroBR(oleo?.value);
    dadosVeiculo.pneus = numeroBR(pneus?.value);
    dadosVeiculo.lavagem = numeroBR(lavagem?.value);
    dadosVeiculo.telefone = numeroBR(telefone?.value);
    dadosVeiculo.outros = numeroBR(outros?.value);

    dadosVeiculo.kmMensal = kmMensalValor;
    dadosVeiculo.custosFixos = totalFixos;

    dadosVeiculo.combustivelPadrao = tipoCombustivel;
    dadosVeiculo.precoGasolina = precoGasolinaValor;
    dadosVeiculo.consumoGasolina = consumoGasolinaValor;
    dadosVeiculo.precoEtanol = precoEtanolValor;
    dadosVeiculo.consumoEtanol = consumoEtanolValor;

    dadosVeiculo.custoFixoKm = custoFixoKm;
    dadosVeiculo.custoCombustivelKm = custoCombustivelKm;
    dadosVeiculo.custoKmReal = custoTotalKm;

    localStorage.setItem("dadosVeiculo", JSON.stringify(dadosVeiculo));
    localStorage.setItem("cadastroVeiculoFixo", JSON.stringify(dadosVeiculo));

    historicoVeiculo.unshift({
      data: new Date().toLocaleString("pt-BR"),
      custosFixos: totalFixos,
      kmMensal: kmMensalValor,
      combustivel: tipoCombustivel,
      custoFixoKm,
      custoCombustivelKm,
      custoKm: custoTotalKm
    });

    historicoVeiculo = historicoVeiculo.slice(0, 3);
    localStorage.setItem("historicoVeiculo", JSON.stringify(historicoVeiculo));

    if (resultado) {
      resultado.textContent =
        `Custo total/km: ${moeda(custoTotalKm)} | Fixo/km: ${moeda(custoFixoKm)} | Combustível/km: ${moeda(custoCombustivelKm)}`;
    }

    const campoCustoKm = pegarElemento("sim-custo-km");
    if (campoCustoKm) {
      campoCustoKm.value = custoTotalKm.toFixed(2).replace(".", ",");
    }

    carregarDadosVeiculoNaTela();
    renderizarHistoricoVeiculo();
    renderizar();
    atualizarDashboard();

    alert("Custo total/km atualizado com sucesso.");
  });
}

function configurarRegras() {
  const valorKm = pegarElemento("regra-valor-km");
  const valorHora = pegarElemento("regra-valor-hora");
  const kmMax = pegarElemento("regra-km-max");
  const nota = pegarElemento("regra-nota");
  const custoKmPadrao = pegarElemento("regra-custo-km");

  if (!valorKm) return;

  valorKm.value = regras.valorKmMin;
  valorHora.value = regras.valorHoraMin;
  kmMax.value = regras.kmMax;
  nota.value = regras.notaMin;

  if (custoKmPadrao) {
    custoKmPadrao.value = regras.custoKmPadrao || 1.55;
  }

  [valorKm, valorHora, kmMax, nota, custoKmPadrao].forEach(input => {
    if (!input) return;

    input.addEventListener("change", () => {
      regras.valorKmMin = numeroBR(valorKm.value);
      regras.valorHoraMin = numeroBR(valorHora.value);
      regras.kmMax = numeroBR(kmMax.value);
      regras.notaMin = numeroBR(nota.value);

      if (custoKmPadrao) {
        regras.custoKmPadrao = numeroBR(custoKmPadrao.value);
      }

      localStorage.setItem("regras", JSON.stringify(regras));
    });
  });
}


// ===============================
// NAVEGAÇÃO
// ===============================
function abrirTela(nomeTela) {
  document.querySelectorAll(".tela").forEach(tela => {
    tela.classList.remove("ativa");
  });

  const telaDestino = pegarElemento(`tela-${nomeTela}`);
  if (telaDestino) telaDestino.classList.add("ativa");

  document.querySelectorAll(".menu button").forEach(btn => {
    btn.classList.remove("ativo");
    if (btn.dataset.tela === nomeTela) btn.classList.add("ativo");
  });
}

function configurarMenu() {
  document.querySelectorAll(".menu button").forEach(btn => {
    btn.addEventListener("click", () => {
      abrirTela(btn.dataset.tela);
    });
  });
}

// ===============================
// RESUMO
// ===============================
function calcularResumo() {
  const corridasPeriodo = filtrarPorPeriodo(corridas);
  const custosPeriodo = filtrarPorPeriodo(custos);

  const faturamento = corridasPeriodo.reduce((t, c) => t + Number(c.valor || 0), 0);
  const custosVariaveis = custosPeriodo.reduce((t, c) => t + Number(c.valor || 0), 0);

  const km = corridasPeriodo.reduce((t, c) => t + Number(c.km || 0), 0);
  const tempo = corridasPeriodo.reduce((t, c) => t + Number(c.tempo || 0), 0);

  // 🔥 NOVO: custo real do veículo
  const custoKm = dadosVeiculo?.custoKmReal || regras.custoKmPadrao || 1.55;
  const custoRodagem = km * custoKm;

  // 🔥 NOVO: custo total real
  const custoTotal = custosVariaveis + custoRodagem;

  const lucro = faturamento - custoTotal;

  return {
    faturamento,
    custosTotal: custoTotal,
    custosVariaveis,
    custoRodagem,
    lucro,
    km,
    tempo,
    valorKm: km > 0 ? faturamento / km : 0,
    valorHora: tempo > 0 ? faturamento / (tempo / 60) : 0,
    ticketMedio: corridasPeriodo.length > 0 ? faturamento / corridasPeriodo.length : 0,
    custoKm,
    totalCorridas: corridasPeriodo.length
  };
}

// ===============================
// DASHBOARD
// ===============================
function atualizarDashboard() {
  const r = calcularResumo();
  const meta = metaDoPeriodo();

  pegarElemento("faturamento").textContent = moeda(r.faturamento);
  pegarElemento("custos").textContent = moeda(r.custosTotal);
  pegarElemento("lucro").textContent = moeda(r.lucro);
  pegarElemento("km-total").textContent = `${r.km.toFixed(1)} km`;
  pegarElemento("valor-km").textContent = moeda(r.valorKm);
  pegarElemento("valor-hora").textContent = moeda(r.valorHora);

 // BLOCO DESEMPENHO
const desempenho = calcularDesempenho();

if (desempenho) {
  const box = pegarElemento("desempenho-box");

  if (box) {
    box.innerHTML = `
      <div class="card destaque">
        <span>Meu desempenho</span>
        <strong>${moeda(desempenho.lucro)}</strong>
        <small>${desempenho.lucro >= 0 ? "Lucro real" : "Prejuízo real"}</small>
      </div>
    `;
  }
}

  const faltam = meta - r.faturamento;
  const percentual = Math.min((r.faturamento / meta) * 100, 100);

  pegarElemento("meta-info").textContent =
    faltam > 0 ? `Faltam ${moeda(faltam)}` : "Meta batida";

  pegarElemento("meta-percentual").textContent = `${percentual.toFixed(0)}%`;
  pegarElemento("barra-meta").style.width = `${percentual}%`;

  atualizarRelatorios(r);
  aplicarStatusVisual(r);
  atualizarDiagnostico(r, meta);
  atualizarGrafico();
  atualizarGraficoEvolucao();
  atualizarPrevisao();
  atualizarRelatorioAnual();
}

function atualizarDiagnostico(r, meta) {
  const diagnosticoEl = pegarElemento("diagnostico-texto");
  if (!diagnosticoEl) return;

  let mensagem = "";

  if (r.totalCorridas === 0) {
    mensagem = "Você ainda não iniciou o período. Comece a rodar.";
  } else if (r.valorKm < 1.5) {
    mensagem = "Seu valor por km está muito baixo. Você está perdendo dinheiro.";
  } else if (r.valorHora < 25) {
    mensagem = "Seu ganho por hora está baixo. Evite corridas longas com pouco retorno.";
  } else if (r.lucro <= 0) {
    mensagem = "Você está no prejuízo. Reveja custos ou selecione melhor as corridas.";
  } else if (r.faturamento < meta * 0.5) {
    mensagem = "Você está abaixo do esperado. Aumente o ritmo.";
  } else if (r.faturamento < meta) {
    mensagem = "Você está no caminho, mas ainda precisa acelerar.";
  } else {
    mensagem = "Excelente desempenho. Continue nesse padrão.";
  }

  diagnosticoEl.textContent = mensagem;
}

function aplicarStatusVisual(r) {
  const cardLucro = pegarElemento("card-lucro");
  const cardCustoKm = pegarElemento("card-custo-km");
  const cardValorHora = pegarElemento("card-valor-hora");

  const cards = [cardLucro, cardCustoKm, cardValorHora];

  cards.forEach(card => {
    if (!card) return;
    card.classList.remove("status-positivo", "status-alerta", "status-negativo");
  });

  if (cardLucro) {
    if (r.lucro > 0) {
      cardLucro.classList.add("status-positivo");
    } else if (r.lucro === 0) {
      cardLucro.classList.add("status-alerta");
    } else {
      cardLucro.classList.add("status-negativo");
    }
  }

  if (cardCustoKm) {
    if (r.custoKm <= 1.6) {
      cardCustoKm.classList.add("status-positivo");
    } else if (r.custoKm <= 2.3) {
      cardCustoKm.classList.add("status-alerta");
    } else {
      cardCustoKm.classList.add("status-negativo");
    }
  }

  if (cardValorHora) {
    if (r.valorHora >= 50) {
      cardValorHora.classList.add("status-positivo");
    } else if (r.valorHora >= 30) {
      cardValorHora.classList.add("status-alerta");
    } else {
      cardValorHora.classList.add("status-negativo");
    }
  }
}

function atualizarRelatorios(r) {
  pegarElemento("rel-total-corridas").textContent = r.totalCorridas;
  pegarElemento("rel-ticket-medio").textContent = moeda(r.ticketMedio);
  pegarElemento("rel-custo-km").textContent = moeda(r.custoKm);
  pegarElemento("rel-lucro-real").textContent = moeda(r.lucro);
}

// ===============================
// LISTAS
// ===============================
function renderizar() {
  const listaCorridas = pegarElemento("lista-corridas");
  const listaCustos = pegarElemento("lista-custos");

  const corridasPeriodo = filtrarPorPeriodo(corridas);
  const custosPeriodo = filtrarPorPeriodo(custos);

  listaCorridas.innerHTML = corridasPeriodo.length
    ? corridasPeriodo.map(c => `
        <div class="item">
          <strong>${c.app} — ${moeda(c.valor)}</strong>
          <p>Data: ${c.data}</p>
          <p>${c.km} km • ${c.tempo} min</p>
          <button onclick="removerCorrida(${corridas.indexOf(c)})">Remover corrida</button>
        </div>
      `).join("")
    : "<p>Nenhuma corrida neste período</p>";

  listaCustos.innerHTML = custosPeriodo.length
    ? custosPeriodo.map(c => `
        <div class="item">
          <strong>${c.categoria} — ${moeda(c.valor)}</strong>
          <p>Data: ${c.data}</p>
          <button onclick="removerCusto(${custos.indexOf(c)})">Remover custo</button>
        </div>
      `).join("")
    : "<p>Nenhum custo neste período</p>";
}

function removerCorrida(index) {
  corridas.splice(index, 1);
  salvar();
  renderizar();
  atualizarDashboard();
}

function removerCusto(index) {
  custos.splice(index, 1);
  salvar();
  renderizar();
  atualizarDashboard();
}

// ===============================
// FORMULÁRIOS
// ===============================
function configurarFormularioCorrida() {
  const form = pegarElemento("form-corrida");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const app = pegarElemento("corrida-app").value;
    const dataCampo = pegarElemento("corrida-data").value;
    const valor = numeroBR(pegarElemento("corrida-valor").value);
    const km = numeroBR(pegarElemento("corrida-km").value);
    const tempo = numeroBR(pegarElemento("corrida-tempo").value);

    if (!valor || !km || !tempo) {
      alert("Preencha valor, km e tempo corretamente.");
      return;
    }

    corridas.push({
      data: formatarDataInput(dataCampo) || dataHoje(),
      app,
      valor,
      km,
      tempo
    });

    salvar();
    renderizar();
    atualizarDashboard();

    form.reset();
    pegarElemento("corrida-app").value = "Uber";
  });
}

function configurarFormularioCusto() {
  const form = pegarElemento("form-custo");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const categoria = pegarElemento("custo-categoria").value;
    const valor = numeroBR(pegarElemento("custo-valor").value);

    if (!valor) {
      alert("Preencha o valor do custo.");
      return;
    }

    custos.push({
      data: formatarDataInput(pegarElemento("data-selecionada").value) || dataHoje(),
      categoria,
      valor
    });

    salvar();
    renderizar();
    atualizarDashboard();

    // 🔥 limpeza correta
    form.reset();
    pegarElemento("custo-categoria").value = "Combustível";
  });
}

// ===============================
// BLOCO 26A — PARSER DE CHAMADA
// ===============================
function normalizarNumero(valorTexto) {
  if (!valorTexto) return 0;

  return Number(
    valorTexto
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(",", ".")
  );
}

function extrairDadosChamada(texto) {
  const textoOriginal = texto || "";

  const textoLimpo = textoOriginal
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const valorMatch =
    textoLimpo.match(/R\$\s?(\d+[.,]?\d*)/i) ||
    textoLimpo.match(/valor\s*:?\s*(\d+[.,]?\d*)/i);

  const kmMatch =
    textoLimpo.match(/(\d+[.,]?\d*)\s?km/i) ||
    textoLimpo.match(/dist[aâ]ncia\s*:?\s*(\d+[.,]?\d*)/i) ||
    textoLimpo.match(/km\s*:?\s*(\d+[.,]?\d*)/i);

  const tempoMatch =
    textoLimpo.match(/(\d+[.,]?\d*)\s?(min|minutos)/i) ||
    textoLimpo.match(/tempo\s*:?\s*(\d+[.,]?\d*)/i);

  const notaMatch =
    textoLimpo.match(/(?:nota|passageiro|avalia[cç][aã]o|rating)\s*:?\s*(\d+[.,]?\d*)/i) ||
    textoLimpo.match(/(\d+[.,]?\d*)\s?★/i);

  return {
    valor: valorMatch ? normalizarNumero(valorMatch[1]) : 0,
    km: kmMatch ? normalizarNumero(kmMatch[1]) : 0,
    tempo: tempoMatch ? normalizarNumero(tempoMatch[1]) : 0,
    nota: notaMatch ? normalizarNumero(notaMatch[1]) : 5
  };
}

function configurarParserChamada() {
  const textarea = pegarElemento("texto-chamada");
  const botao = pegarElemento("btn-processar-chamada");

  if (!textarea || !botao) return;

  botao.addEventListener("click", () => {
    const dados = extrairDadosChamada(textarea.value);

    if (!dados.valor || !dados.km || !dados.tempo) {
      alert("Não consegui identificar valor, km e tempo no texto da chamada.");
      return;
    }

    pegarElemento("sim-valor").value = String(dados.valor).replace(".", ",");
    pegarElemento("sim-km").value = String(dados.km).replace(".", ",");
    pegarElemento("sim-tempo").value = String(dados.tempo).replace(".", ",");

    const campoNota = pegarElemento("sim-nota");
    if (campoNota) campoNota.value = String(dados.nota).replace(".", ",");

    const tipoCorrida = pegarElemento("sim-tipo-corrida")?.value || "app";
    const custoKmInput = pegarElemento("sim-custo-km");

    if (custoKmInput && !custoKmInput.value) {
      custoKmInput.value =
        tipoCorrida === "particular"
          ? String(regras.custoKmPadrao || 1.55).replace(".", ",")
          : "1,55";
    }

    const formSimulador = pegarElemento("form-simulador");
    formSimulador.dispatchEvent(new Event("submit"));

    setTimeout(() => {
      const appCorrida = pegarElemento("sim-app")?.value || "Uber";
      const valor = numeroBR(pegarElemento("sim-valor").value);
      const km = numeroBR(pegarElemento("sim-km").value);
      const tempo = numeroBR(pegarElemento("sim-tempo").value);
      const custoKm = tipoCorrida === "particular"
        ? Number(regras.custoKmPadrao || 1.55)
        : numeroBR(pegarElemento("sim-custo-km").value);

      const nota = numeroBR(pegarElemento("sim-nota")?.value || 5);

      const resultado = analisarChamada(valor, km, tempo, custoKm, nota);

      resultado.tipoCorrida = tipoCorrida;
      resultado.appCorrida = appCorrida;

      historicoChamadas.unshift({
        data: new Date().toLocaleString("pt-BR"),
        decisao: resultado.decisao,
        tipo: resultado.tipo,
        score: resultado.score,
        tipoCorrida,
        appCorrida,
        valor,
        km,
        tempo,
        nota,
        valorKm: resultado.valorKm,
        valorHora: resultado.valorHora,
        valorMinuto: resultado.valorMinuto,
        custoEstimado: resultado.custoEstimado,
        lucroEstimado: resultado.lucroEstimado
      });

      historicoChamadas = historicoChamadas.slice(0, 10);
      localStorage.setItem("historicoChamadas", JSON.stringify(historicoChamadas));

      renderizarHistoricoChamadas();
      textarea.value = "";
    }, 100);
  });
}

// ===============================
// SIMULADOR — BLOCO 25 REGRAS DO MOTORISTA
// ===============================
function analisarChamada(valor, km, tempo, custoKm, notaPassageiro = 5) {
  const custoEstimado = km * custoKm;
  const lucroEstimado = valor - custoEstimado;
  const valorKm = km > 0 ? valor / km : 0;
  const valorHora = tempo > 0 ? valor / (tempo / 60) : 0;
  const valorMinuto = tempo > 0 ? valor / tempo : 0;

  if (valorKm < regras.valorKmMin) {
    return {
      decisao: "RECUSAR",
      tipo: "recusar",
      motivo: `Abaixo do valor mínimo por km definido: ${moeda(regras.valorKmMin)}.`,
      score: 0,
      custoEstimado,
      lucroEstimado,
      valorKm,
      valorHora,
      valorMinuto
    };
  }

  if (valorHora < regras.valorHoraMin) {
    return {
      decisao: "RECUSAR",
      tipo: "recusar",
      motivo: `Abaixo do valor mínimo por hora definido: ${moeda(regras.valorHoraMin)}.`,
      score: 0,
      custoEstimado,
      lucroEstimado,
      valorKm,
      valorHora,
      valorMinuto
    };
  }

  if (km > regras.kmMax) {
    return {
      decisao: "RECUSAR",
      tipo: "recusar",
      motivo: `Distância acima do limite definido: ${regras.kmMax} km.`,
      score: 0,
      custoEstimado,
      lucroEstimado,
      valorKm,
      valorHora,
      valorMinuto
    };
  }

  if (notaPassageiro < regras.notaMin) {
    return {
      decisao: "RECUSAR",
      tipo: "recusar",
      motivo: `Nota do passageiro abaixo do mínimo definido: ${regras.notaMin}.`,
      score: 0,
      custoEstimado,
      lucroEstimado,
      valorKm,
      valorHora,
      valorMinuto
    };
  }

  let score = 0;

  if (valorKm >= 2.5) score += 35;
  else if (valorKm >= 2.0) score += 28;
  else if (valorKm >= 1.7) score += 18;
  else if (valorKm >= 1.4) score += 10;

  if (valorHora >= 55) score += 30;
  else if (valorHora >= 45) score += 24;
  else if (valorHora >= 35) score += 15;
  else if (valorHora >= 25) score += 8;

  if (lucroEstimado > 20) score += 25;
  else if (lucroEstimado > 10) score += 18;
  else if (lucroEstimado > 0) score += 10;

  if (km <= 5) score += 10;
  else if (km <= 10) score += 6;
  else if (km <= 15) score += 3;

  if (notaPassageiro >= 4.9) score += 5;
  else if (notaPassageiro >= 4.7) score += 3;

  score = Math.min(score, 100);

  let decisao = "RECUSAR";
  let tipo = "recusar";
  let motivo = "Corrida com baixa eficiência financeira.";

  if (score >= 75) {
    decisao = "ACEITAR";
    tipo = "aceitar";
    motivo = "Corrida forte. Boa relação entre valor, tempo, distância, nota e lucro.";
  } else if (score >= 50) {
    decisao = "ANALISAR";
    tipo = "analisar";
    motivo = "Corrida intermediária. Pode valer dependendo da região e do retorno.";
  }

  return {
    decisao,
    tipo,
    motivo,
    score,
    custoEstimado,
    lucroEstimado,
    valorKm,
    valorHora,
    valorMinuto
  };
}

// ===============================
// BLOCO 32 — INTEGRAR CUSTO AO SIMULADOR
// ===============================
function aplicarCustoAutomaticoSimulador() {
  const campoCustoKm = pegarElemento("sim-custo-km");

  if (!campoCustoKm) return;

  // Se já existe custo real calculado
  if (dadosVeiculo && dadosVeiculo.custoKmReal > 0) {
    campoCustoKm.value = dadosVeiculo.custoKmReal
      .toFixed(2)
      .replace(".", ",");

    campoCustoKm.setAttribute("readonly", true);
    campoCustoKm.style.opacity = "0.6";
  } else {
    // fallback para padrão
    campoCustoKm.value = String(regras.custoKmPadrao || 1.55).replace(".", ",");
  }
}

  // ===============================
  // SCORE DA CORRIDA
  // ===============================
function configurarSimulador() {
  aplicarCustoAutomaticoSimulador();

  const form = pegarElemento("form-simulador");
  const box = pegarElemento("resultado-simulador");

  if (!form || !box) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const tipoCorrida = pegarElemento("sim-tipo-corrida")?.value || "app";
    const appCorrida = pegarElemento("sim-app")?.value || "Uber";

    const valor = numeroBR(pegarElemento("sim-valor").value);
    const km = numeroBR(pegarElemento("sim-km").value);
    const tempo = numeroBR(pegarElemento("sim-tempo").value);

    let custoKm = numeroBR(pegarElemento("sim-custo-km").value);

    if (tipoCorrida === "particular") {
      custoKm = Number(regras.custoKmPadrao || 1.55);
    }

    const notaPassageiro = numeroBR(pegarElemento("sim-nota")?.value || 5);

    if (!valor || !km || !tempo || !custoKm) {
      alert("Preencha valor, km, tempo e custo/km.");
      return;
    }

    const resultado = analisarChamada(valor, km, tempo, custoKm, notaPassageiro);

    resultado.tipoCorrida = tipoCorrida;
    resultado.appCorrida = appCorrida;

    box.className = `resultado ${resultado.tipo}`;

    const decisaoRapida = pegarElemento("decisao-rapida");

    if (decisaoRapida) {
      decisaoRapida.className = `decisao-rapida ${resultado.tipo}`;
      decisaoRapida.textContent = `${resultado.decisao} — SCORE ${resultado.score}/100`;
    }

    box.innerHTML = `
      <h3>${resultado.decisao}</h3>

      <p><strong>Tipo:</strong> ${
        tipoCorrida === "particular" ? "Particular" : appCorrida
      }</p>

      <div class="score-box">
        <span>Score da corrida</span>
        <strong>${resultado.score}/100</strong>

        <div class="score-barra">
          <div style="width: ${resultado.score}%"></div>
        </div>
      </div>

      <p>${resultado.motivo}</p>

      <p><strong>Valor/km:</strong> ${moeda(resultado.valorKm)}</p>
      <p><strong>Valor/hora:</strong> ${moeda(resultado.valorHora)}</p>
      <p><strong>Valor/min:</strong> ${moeda(resultado.valorMinuto)}</p>
      <p><strong>Custo/km usado:</strong> ${moeda(custoKm)}</p>
      <p><strong>Custo:</strong> ${moeda(resultado.custoEstimado)}</p>
      <p><strong>Lucro:</strong> ${moeda(resultado.lucroEstimado)}</p>
    `;

    box.classList.remove("oculto");
  });
}
// ===============================
// RELATÓRIOS
// ===============================
function configurarRelatorios() {
  pegarElemento("btn-exportar").addEventListener("click", () => {
    let csv = "TIPO,DATA,CATEGORIA_APP,VALOR,KM,TEMPO\n";

    corridas.forEach(c => {
      csv += `CORRIDA,${c.data},${c.app},${c.valor},${c.km},${c.tempo}\n`;
    });

    custos.forEach(c => {
      csv += `CUSTO,${c.data},${c.categoria},${c.valor},,\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-drivelucro.csv";
    link.click();

    URL.revokeObjectURL(url);
  });

  pegarElemento("btn-limpar-dados").addEventListener("click", () => {
    const confirmar = confirm("Tem certeza que deseja apagar todos os dados?");
    if (!confirmar) return;

    corridas = [];
    custos = [];

    salvar();
    renderizar();
    atualizarDashboard();
  });
}

// ===============================
// CARDS E FILTROS
// ===============================
function configurarCardsDashboard() {
  document.querySelectorAll(".card-click").forEach(card => {
    card.addEventListener("click", () => {
      const destino = card.dataset.acaoCard;
      if (!destino) return;
      abrirTela(destino);
    });
  });
}

function configurarFiltroPeriodo() {
  document.querySelectorAll(".periodo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".periodo-btn").forEach(b => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      periodoAtual = btn.dataset.periodo || "dia";

      renderizar();
      atualizarDashboard();
    });
  });
}

// ===============================
// BLOCO 23 — CONTROLE DE DATA
// ===============================
function configurarControleData() {
  const input = pegarElemento("data-selecionada");
  const btnAnterior = pegarElemento("btn-dia-anterior");
  const btnProximo = pegarElemento("btn-proximo-dia");

  if (!input) return;

  atualizarInputData();

  input.addEventListener("change", () => {
    dataSelecionada = new Date(input.value);
    renderizar();
    atualizarDashboard();
  });

  btnAnterior.addEventListener("click", () => {
    dataSelecionada.setDate(dataSelecionada.getDate() - 1);
    atualizarInputData();
    renderizar();
    atualizarDashboard();
  });

  btnProximo.addEventListener("click", () => {
    dataSelecionada.setDate(dataSelecionada.getDate() + 1);
    atualizarInputData();
    renderizar();
    atualizarDashboard();
  });
}

// ===============================
// BLOCO 29 — GRÁFICOS PROFISSIONAIS
// ===============================
function desenharBarraArredondada(ctx, x, y, largura, altura, raio) {
  ctx.beginPath();
  ctx.moveTo(x + raio, y);
  ctx.lineTo(x + largura - raio, y);
  ctx.quadraticCurveTo(x + largura, y, x + largura, y + raio);
  ctx.lineTo(x + largura, y + altura);
  ctx.lineTo(x, y + altura);
  ctx.lineTo(x, y + raio);
  ctx.quadraticCurveTo(x, y, x + raio, y);
  ctx.closePath();
  ctx.fill();
}

function atualizarGrafico() {
  const canvas = pegarElemento("grafico-financeiro");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const r = calcularResumo();

  canvas.width = canvas.parentElement.clientWidth - 24;
  canvas.height = 240;

  const dados = [
    { label: "Faturamento", valor: r.faturamento, cor: "#7CFC00" },
    { label: "Custos", valor: r.custosTotal, cor: "#f97316" },
    { label: "Lucro", valor: r.lucro, cor: r.lucro >= 0 ? "#7CFC00" : "#ef4444" }
  ];

  const maior = Math.max(...dados.map(d => Math.abs(d.valor)), 1);

  let progresso = 0;

  function animar() {
    progresso += 0.05;
    if (progresso > 1) progresso = 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const baseY = 180;
    const alturaMax = 120;
    const larguraBarra = Math.min(60, canvas.width / 5);
    const espaco = (canvas.width - larguraBarra * 3) / 4;

    dados.forEach((dado, index) => {
      const x = espaco + index * (larguraBarra + espaco);
      const alturaFinal = (Math.abs(dado.valor) / maior) * alturaMax;
      const altura = alturaFinal * progresso;
      const y = baseY - altura;

      const grad = ctx.createLinearGradient(0, y, 0, baseY);
      grad.addColorStop(0, dado.cor);
      grad.addColorStop(1, "rgba(255,255,255,0.2)");

      ctx.fillStyle = grad;
      ctx.shadowColor = dado.cor;
      ctx.shadowBlur = 15;

      ctx.fillRect(x, y, larguraBarra, altura);

      ctx.shadowBlur = 0;

      if (progresso === 1) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(moeda(dado.valor), x + larguraBarra / 2, y - 10);

        ctx.fillStyle = "#94a3b8";
        ctx.fillText(dado.label, x + larguraBarra / 2, baseY + 20);
      }
    });

    if (progresso < 1) requestAnimationFrame(animar);
  }

  animar();
}

function atualizarGraficoEvolucao() {
  const canvas = pegarElemento("grafico-evolucao");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  canvas.width = canvas.parentElement.clientWidth - 24;
  canvas.height = 240;

  const corridasPeriodo = filtrarPorPeriodo(corridas);
  const agrupado = {};

  corridasPeriodo.forEach(c => {
    if (!agrupado[c.data]) agrupado[c.data] = 0;
    agrupado[c.data] += Number(c.valor || 0);
  });

  const labels = Object.keys(agrupado);
  const valores = Object.values(agrupado);

  if (!valores.length) return;

  const maior = Math.max(...valores, 1);

  let progresso = 0;

  function animarLinha() {
    progresso += 0.05;
    if (progresso > 1) progresso = 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const baseY = 180;
    const alturaMax = 120;
    const larguraUtil = canvas.width - padding * 2;

    const pontos = valores.map((valor, index) => {
      const x = valores.length === 1
        ? canvas.width / 2
        : padding + (index * larguraUtil) / (valores.length - 1);

      const yFinal = baseY - (valor / maior) * alturaMax;
      const y = baseY - (baseY - yFinal) * progresso;

      return { x, y, valor };
    });

    ctx.beginPath();
    pontos.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });

    ctx.strokeStyle = "#7CFC00";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#7CFC00";
    ctx.shadowBlur = 10;
    ctx.stroke();

    ctx.shadowBlur = 0;

    if (progresso === 1) {
      pontos.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#7CFC00";
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(moeda(p.valor), p.x, p.y - 12);
      });
    }

    if (progresso < 1) requestAnimationFrame(animarLinha);
  }

  animarLinha();
}

// ===============================
// PREVISÃO
// ===============================
function atualizarPrevisao() {
  const el = pegarElemento("previsao-texto");
  if (!el) return;

  const r = calcularResumo();

  if (r.totalCorridas === 0) {
    el.textContent = "Ainda não há dados suficientes para prever o fechamento.";
    return;
  }

  const mediaPorCorrida = r.faturamento / r.totalCorridas;
  const previsaoComMais3 = r.faturamento + mediaPorCorrida * 3;
  const lucroProjetado = previsaoComMais3 - r.custosTotal;

  el.textContent =
    `Se mantiver esse ritmo, com mais 3 corridas parecidas você pode fechar o período com aproximadamente ${moeda(previsaoComMais3)} de faturamento e ${moeda(lucroProjetado)} de lucro.`;
}


// ===============================
// SPLASH E INIT
// ===============================
function finalizarSplash() {
  const splash = pegarElemento("splash-screen");
  if (!splash) return;

  splash.classList.add("sair");

  setTimeout(() => {
    splash.style.display = "none";
  }, 500);
}
  function configurarTipoCorridaSimulador() {
  const tipo = pegarElemento("sim-tipo-corrida");
  const app = pegarElemento("sim-app");
  const custoKm = pegarElemento("sim-custo-km");

  if (!tipo || !custoKm) return;

  function atualizarCampo() {
    if (tipo.value === "particular") {
      if (app) app.value = "Particular";
      custoKm.value = String(regras.custoKmPadrao || 1.55).replace(".", ",");
      custoKm.style.display = "none";
    } else {
      if (app && app.value === "Particular") app.value = "Uber";
      custoKm.style.display = "block";
    }
  }

  tipo.addEventListener("change", atualizarCampo);
  atualizarCampo();
}

function atualizarRelatorioAnual() {
  const box = pegarElemento("relatorio-anual");
  if (!box) return;

  box.innerHTML = "";
}

function renderizarHistoricoVeiculo() {
  const box = pegarElemento("historico-veiculo");
  if (!box) return;

  if (!historicoVeiculo.length) {
    box.innerHTML = "<p>Nenhum cálculo registrado ainda.</p>";
    return;
  }

  box.innerHTML = historicoVeiculo.map(item => `
    <div class="item">
      <strong>${moeda(item.custoKm)} por km</strong>
      <p>${item.data}</p>
      <p>Custos fixos: ${moeda(item.custosFixos)}</p>
      <p>Km mensal: ${Number(item.kmMensal).toFixed(1)} km</p>
    </div>
  `).join("");
}

function init() {
  configurarMenu();
  configurarFormularioCorrida();
  configurarFormularioCusto();
  carregarDadosVeiculoNaTela();
  configurarAutoSaveVeiculo();
  controlarCamposCombustivel();

  configurarSimulador();
  configurarRelatorios();
  configurarCardsDashboard();
  configurarFiltroPeriodo();
  configurarRegras();
  configurarParserChamada();
  renderizarHistoricoChamadas();
  configurarControleData();
  configurarCustoVeiculo();
  renderizarHistoricoVeiculo();
 
  configurarDrawer();

  renderizar();
  atualizarDashboard();
  abrirTela("dashboard");

  setTimeout(finalizarSplash, 1200);
}

function renderizarHistoricoChamadas() {
  const box = pegarElemento("historico-chamadas");
  const metricasBox = pegarElemento("metricas-resumo");

  if (!box) return;

  if (!historicoChamadas.length) {
    box.innerHTML = "<p>Nenhuma chamada analisada ainda.</p>";
    if (metricasBox) metricasBox.innerHTML = "";
    return;
  }

  // ===============================
  // MÉTRICAS
  // ===============================
  const total = historicoChamadas.length;

  const aceitas = historicoChamadas.filter(i => i.tipo === "aceitar").length;
  const recusadas = historicoChamadas.filter(i => i.tipo === "recusar").length;
  const analisadas = historicoChamadas.filter(i => i.tipo === "analisar").length;

  const scoreMedio = (
    historicoChamadas.reduce((t, i) => t + i.score, 0) / total
  ).toFixed(0);

  const valorMedio = (
    historicoChamadas.reduce((t, i) => t + i.valor, 0) / total
  ).toFixed(2);

  const valorHoraMedio = (
    historicoChamadas.reduce((t, i) => t + i.valorHora, 0) / total
  ).toFixed(2);

  if (metricasBox) {
    metricasBox.innerHTML = `
      <strong>Resumo das decisões</strong>
      <p>Total analisado: ${total}</p>
      <p>✔ Aceitas: ${aceitas}</p>
      <p>⚠ Analisadas: ${analisadas}</p>
      <p>❌ Recusadas: ${recusadas}</p>
      <p>Score médio: ${scoreMedio}</p>
      <p>Valor médio: R$ ${valorMedio}</p>
      <p>Valor/hora médio: R$ ${valorHoraMedio}</p>
    `;
  }

  // ===============================
  // LISTA
  // ===============================
  box.innerHTML = historicoChamadas.map(item => `
    <div class="historico-chamada-item ${item.tipo}">
      <strong>${item.decisao} — Score ${item.score}/100</strong>
      <p>${item.data}</p>
      <p>Valor: ${moeda(item.valor)} • Km: ${item.km} • Tempo: ${item.tempo} min • Nota: ${item.nota}</p>
      <p>Valor/km: ${moeda(item.valorKm)} • Valor/hora: ${moeda(item.valorHora)}</p>
      <p>Custo: ${moeda(item.custoEstimado)} • Lucro: ${moeda(item.lucroEstimado)}</p>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", init);

  setTimeout(finalizarSplash, 1600);


// ===============================
// BLOCO 30 — CONTROLE DRAWER
// ===============================

function configurarDrawer() {
  const btnMenu = pegarElemento("btn-menu");
  const drawer = pegarElemento("drawer");
  const overlay = pegarElemento("overlay");

  if (!btnMenu || !drawer || !overlay) return;

  // Abrir menu
  btnMenu.addEventListener("click", () => {
    drawer.classList.add("ativo");
    overlay.classList.add("ativo");
  });

  // Fechar menu
  overlay.addEventListener("click", () => {
    drawer.classList.remove("ativo");
    overlay.classList.remove("ativo");
  });

  // 🔥 TROCA DE TELA (AQUI É O PROBLEMA)
  document.querySelectorAll(".drawer-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const tela = btn.getAttribute("data-tela");

      if (tela) {
        console.log("Abrindo tela:", tela); // DEBUG
        abrirTela(tela);
      }

      drawer.classList.remove("ativo");
      overlay.classList.remove("ativo");
    });
  });
}
// ===============================
// BLOCO 36.2 — CONTROLE DE COMBUSTÍVEL (UX PROFISSIONAL)
// ===============================
function controlarCamposCombustivel() {
  const tipo = pegarElemento("veiculo-combustivel-padrao");

  const gasolinaCampos = [
    pegarElemento("veiculo-preco-gasolina"),
    pegarElemento("veiculo-consumo-gasolina")
  ];

  const etanolCampos = [
    pegarElemento("veiculo-preco-etanol"),
    pegarElemento("veiculo-consumo-etanol")
  ];

  function atualizar() {
    if (!tipo) return;

    if (tipo.value === "gasolina") {
      gasolinaCampos.forEach(c => c && (c.style.display = "block"));
      etanolCampos.forEach(c => c && (c.style.display = "none"));
    }

    if (tipo.value === "etanol") {
      gasolinaCampos.forEach(c => c && (c.style.display = "none"));
      etanolCampos.forEach(c => c && (c.style.display = "block"));
    }
  }

  tipo?.addEventListener("change", atualizar);

  atualizar(); // inicializa
}
// ===============================
// BLOCO 40 — FECHAMENTO REAL DO DIA
// ===============================
function calcularFechamentoDia() {

  const kmInicial = parseFloat(pegarElemento("km-inicial")?.value?.replace(",", ".") || 0);
  const kmFinal = parseFloat(pegarElemento("km-final")?.value?.replace(",", ".") || 0);

  if (!kmInicial || !kmFinal || kmFinal <= kmInicial) {
    alert("Preencha KM inicial e final corretamente.");
    return;
  }

  const kmRodado = kmFinal - kmInicial;

  const dadosVeiculo = JSON.parse(localStorage.getItem("dadosVeiculo")) || {};
  const custoKm = dadosVeiculo.custoKmReal || 0;

  const corridas = JSON.parse(localStorage.getItem("corridas")) || [];
  const custos = JSON.parse(localStorage.getItem("custos")) || [];

  // faturamento do dia
  const faturamento = corridas.reduce((total, c) => total + Number(c.valor || 0), 0);

  // custos variáveis
  const custosVariaveis = custos.reduce((total, c) => total + Number(c.valor || 0), 0);

  const custoTotal = kmRodado * custoKm;

  const lucro = faturamento - custoTotal - custosVariaveis;

  pegarElemento("km-rodado-dia").innerText = `KM rodado: ${kmRodado.toFixed(1)} km`;
  pegarElemento("custo-dia").innerText = `Custo do dia: R$ ${custoTotal.toFixed(2)}`;
  pegarElemento("lucro-dia").innerText = `Lucro real: R$ ${lucro.toFixed(2)}`;
}
// ===============================
// BLOCO 40 — FECHAMENTO REAL DO DIA
// ===============================
function calcularFechamentoDia() {
  const kmInicial = numeroBR(pegarElemento("km-inicial")?.value);
  const kmFinal = numeroBR(pegarElemento("km-final")?.value);

  if (!kmInicial || !kmFinal || kmFinal <= kmInicial) {
    alert("Preencha o KM inicial e final corretamente.");
    return;
  }

  const resumo = calcularResumo();
  const kmRodadoReal = kmFinal - kmInicial;
  const custoKmReal = dadosVeiculo?.custoKmReal || 0;

  if (!custoKmReal) {
    alert("Configure o custo/km em Meu Veículo.");
    return;
  }

  const custoRealDia = kmRodadoReal * custoKmReal;
  const lucroRealDia = resumo.faturamento - resumo.custosVariaveis - custoRealDia;

  pegarElemento("km-rodado-dia").textContent =
    `KM rodado: ${kmRodadoReal.toFixed(1)} km`;

  pegarElemento("custo-dia").textContent =
    `Custo do dia: ${moeda(custoRealDia)}`;

  const lucroEl = pegarElemento("lucro-dia");
  lucroEl.textContent = `Lucro real: ${moeda(lucroRealDia)}`;
  lucroEl.style.color = lucroRealDia >= 0 ? "#7CFC00" : "#ef4444";

  salvarFechamentoDia(kmInicial, kmFinal, {
    custo: custoRealDia,
    lucro: lucroRealDia
  });

  atualizarDashboard();
}

// ===============================
// BLOCO 41 — SALVAR FECHAMENTO REAL
// ===============================
function salvarFechamentoDia(kmInicial, kmFinal, resultado) {
  let fechamentos = JSON.parse(localStorage.getItem("fechamentos")) || [];

  const data = dataHoje();

  fechamentos = fechamentos.filter(f => f.data !== data);

  fechamentos.push({
    data,
    kmInicial,
    kmFinal,
    kmRodado: kmFinal - kmInicial,
    custoDia: resultado.custo,
    lucroDia: resultado.lucro
  });

  localStorage.setItem("fechamentos", JSON.stringify(fechamentos));
}

// ===============================
// BLOCO 42 — MEU DESEMPENHO
// ===============================
function calcularDesempenho() {
  const fechamentos = JSON.parse(localStorage.getItem("fechamentos")) || [];

  if (!fechamentos.length) return null;

  const periodo = filtrarPorPeriodo(fechamentos);

  if (!periodo.length) return null;

  const totalKm = periodo.reduce((acc, f) => acc + Number(f.kmRodado || 0), 0);
  const totalCusto = periodo.reduce((acc, f) => acc + Number(f.custoDia || 0), 0);
  const totalLucro = periodo.reduce((acc, f) => acc + Number(f.lucroDia || 0), 0);

  return {
    km: totalKm,
    custo: totalCusto,
    lucro: totalLucro
  };
}