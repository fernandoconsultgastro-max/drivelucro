// =====================================================
// DRIVELUCRO — APP.JS
// VERSÃO CORRIGIDA — BLOCOS 16, 17, 18B, 19
// =====================================================

let corridas = JSON.parse(localStorage.getItem("corridas")) || [];
let custos = JSON.parse(localStorage.getItem("custos")) || [];

const META_DIARIA = 0;
let periodoAtual = "dia";
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
  valorKmMin: 0,
  valorHoraMin: 0,
  kmMax: 0,
  notaMin: 0,
  custoKmPadrao: 0
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

// ===============================
// NORMALIZADOR DE REGRAS (DECIMAL CORRETO)
// ===============================
function numeroRegra(valor) {
  if (!valor) return 0;

  return Number(
    String(valor)
      .replace("R$", "")
      .replace(/\s/g, "")
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

function moeda(v) {
  return `R$ ${Number(v || 0).toFixed(2)}`;
}

// ===============================
// BLOCO PREMIUM 03 — COPILOTO INTELIGENTE
// MANUTENÇÃO:
// Decide automaticamente se vale a corrida.
// ===============================
function gerarCopilotoInteligente(valor, km, tempo, nota) {
  const custoKm = dadosVeiculo?.custoKmReal || 0;

  const valorKm = km > 0 ? valor / km : 0;
  const valorHora = tempo > 0 ? valor / (tempo / 60) : 0;
  const custoTotal = km * custoKm;
  const lucro = valor - custoTotal;

  let decisao = "";
  let classe = "";
  let motivo = "";

  if (valorKm < custoKm || lucro <= 0) {
    decisao = "RECUSAR ❌";
    classe = "recusar";
    motivo = "Corrida abaixo do custo ou prejuízo.";
  } else if (valorKm >= custoKm * 2 && valorHora >= 30) {
    decisao = "ACEITAR ✔";
    classe = "aceitar";
    motivo = "Alta rentabilidade.";
  } else {
    decisao = "ANALISAR ⚠";
    classe = "analisar";
    motivo = "Margem moderada.";
  }

  return {
    decisao,
    classe,
    motivo,
    valorKm,
    valorHora,
    lucro
  };
}

// ===============================
// BLOCO 44 — LIMPAR CAMPOS VISUAIS
// MANUTENÇÃO:
// Remove dados fantasmas da interface após reset.
// ===============================
function limparCamposVeiculo() {
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
    "veiculo-preco-gasolina",
    "veiculo-consumo-gasolina",
    "veiculo-preco-etanol",
    "veiculo-consumo-etanol",
    "sim-custo-km",
    "km-inicial",
    "km-final"
  ];

  ids.forEach(id => {
    const el = pegarElemento(id);
    if (el) el.value = "";
  });

  const resultadoVeiculo = pegarElemento("resultado-custo-veiculo");
  if (resultadoVeiculo) resultadoVeiculo.textContent = "Custo total/km: R$ 0,00";

  const desempenhoBox = pegarElemento("desempenho-box");
  if (desempenhoBox) desempenhoBox.innerHTML = "";

  const historicoVeiculoBox = pegarElemento("historico-veiculo");
  if (historicoVeiculoBox) historicoVeiculoBox.innerHTML = "<p>Nenhum cálculo registrado ainda.</p>";

  const kmRodadoDia = pegarElemento("km-rodado-dia");
  const custoDia = pegarElemento("custo-dia");
  const lucroDia = pegarElemento("lucro-dia");

  if (kmRodadoDia) kmRodadoDia.textContent = "KM rodado: -";
  if (custoDia) custoDia.textContent = "Custo do dia: -";
  if (lucroDia) lucroDia.textContent = "Lucro real: -";
}

// ===============================
// BLOCO 46 — META DINÂMICA
// MANUTENÇÃO:
// Permite definir meta por período (dia, semana, mês, ano)
// e salvar no localStorage.
// ===============================
function obterMeta() {
  const metas = JSON.parse(localStorage.getItem("metas")) || {
    dia: 0,
    semana: 0,
    mes: 0,
    ano: 0
  };

  return metas[periodoAtual] || 0;
}

function salvarMeta(valor) {
  let metas = JSON.parse(localStorage.getItem("metas")) || {
    dia: 0,
    semana: 0,
    mes: 0,
    ano: 0
  };

  metas[periodoAtual] = Number(valor || 0);

  localStorage.setItem("metas", JSON.stringify(metas));

  atualizarDashboard();
}
// ===============================
// BLOCO 48 — DEFINIR META
// ===============================
function definirMeta() {
  const valor = numeroBR(pegarElemento("input-meta")?.value);

  if (!valor || valor <= 0) {
    alert("Digite uma meta válida.");
    return;
  }

  salvarMeta(valor);

  pegarElemento("input-meta").value = "";
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
// ===============================
// BLOCO 33 — REGRAS DO SIMULADOR
// MANUTENÇÃO:
// Não preenche campos com zero.
// Mantém apenas placeholder visual até o motorista definir regras.
// ===============================
function configurarRegras() {
  const valorKm = pegarElemento("regra-valor-km");
  const valorHora = pegarElemento("regra-valor-hora");
  const kmMax = pegarElemento("regra-km-max");
  const nota = pegarElemento("regra-nota");

  if (!valorKm || !valorHora || !kmMax || !nota) return;

  valorKm.value = regras.valorKmMin > 0 ? String(regras.valorKmMin).replace(".", ",") : "";
  valorHora.value = regras.valorHoraMin > 0 ? String(regras.valorHoraMin).replace(".", ",") : "";
  kmMax.value = regras.kmMax > 0 ? String(regras.kmMax).replace(".", ",") : "";
  nota.value = regras.notaMin > 0 ? String(regras.notaMin).replace(".", ",") : "";

  [valorKm, valorHora, kmMax, nota].forEach(input => {
    input.addEventListener("change", () => {
    regras.valorKmMin = numeroRegra(valorKm.value);
    regras.valorHoraMin = numeroRegra(valorHora.value);
    regras.kmMax = numeroRegra(kmMax.value);
    regras.notaMin = numeroRegra(nota.value);

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

  const faturamento = corridasPeriodo.reduce((t, c) => {
    return t + Number(c.valor || 0);
  }, 0);

  const custosVariaveis = custosPeriodo.reduce((t, c) => {
    return t + Number(c.valor || 0);
  }, 0);

  const km = corridasPeriodo.reduce((t, c) => {
    return t + Number(c.km || 0);
  }, 0);

  const tempo = corridasPeriodo.reduce((t, c) => {
    return t + Number(c.tempo || 0);
  }, 0);

  const custoKm = Number(dadosVeiculo?.custoKmReal || 0);
  const custoRodagem = km > 0 && custoKm > 0 ? km * custoKm : 0;

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
 const meta = obterMeta();
// ===============================
// BLOCO 20 — DASHBOARD SEGURO
// MANUTENÇÃO:
// Proteção contra undefined / NaN
// Separação clara de custos (manual vs operacional)
// ===============================

const elFaturamento = pegarElemento("faturamento");
const elCustos = pegarElemento("custos");
const elLucro = pegarElemento("lucro");
const elKmTotal = pegarElemento("km-total");
const elValorKm = pegarElemento("valor-km");
const elValorHora = pegarElemento("valor-hora");
const elCustosDetalhe = pegarElemento("custos-detalhe");

// 🔒 PROTEÇÃO TOTAL DE DADOS
const faturamento = Number(r?.faturamento || 0);
const custoManual = Number(r?.custosVariaveis || 0);
const custoOperacional = Number(r?.custoRodagem || 0);
const custoTotal = Number(r?.custosTotal || 0);
const lucro = Number(r?.lucro || 0);
const km = Number(r?.km || 0);
const valorKm = Number(r?.valorKm || 0);
const valorHora = Number(r?.valorHora || 0);

// ===============================
// CARDS PRINCIPAIS
// ===============================

if (elFaturamento) elFaturamento.textContent = moeda(faturamento);

if (elCustos) elCustos.textContent = moeda(custoTotal);

if (elLucro) elLucro.textContent = moeda(lucro);

if (elKmTotal) elKmTotal.textContent = `${km.toFixed(1)} km`;

if (elValorKm) elValorKm.textContent = moeda(valorKm);

if (elValorHora) elValorHora.textContent = moeda(valorHora);

// 🔥 DETALHE INTELIGENTE DE CUSTOS (TRANSPARÊNCIA)
if (elCustosDetalhe) {
  elCustosDetalhe.textContent =
    `Lançados: ${moeda(custoManual)} • Rodagem: ${moeda(custoOperacional)}`;
}
// ===============================
// BLOCO DESEMPENHO
// ===============================

const desempenho = calcularDesempenho?.();

if (desempenho) {
  const box = pegarElemento("desempenho-box");

  if (box) {
    const lucroDesempenho = Number(desempenho?.lucro || 0);

    const classeStatus = lucroDesempenho >= 0
      ? "status-positivo"
      : "status-negativo";

    box.innerHTML = `
      <div class="card ${classeStatus}">
        <span>Resultado real do período</span>
        <strong>${moeda(lucroDesempenho)}</strong>
        <small>
          ${lucroDesempenho >= 0 ? "Lucro real" : "Prejuízo real"} • Baseado no KM real do veículo
        </small>
      </div>
    `;
  }
}
// ===============================
// BLOCO 21 — META DO PERÍODO
// MANUTENÇÃO:
// Atualiza a meta somente se os elementos existirem.
// Evita quebra da interface quando algum ID não estiver no HTML.
// ===============================
const faltam = meta - r.faturamento;
const percentual = meta > 0
  ? Math.min((r.faturamento / meta) * 100, 100)
  : 0;

const metaInfo = pegarElemento("meta-info");
const metaPercentual = pegarElemento("meta-percentual");
const barraMeta = pegarElemento("barra-meta");

if (metaInfo) {
  metaInfo.textContent =
    meta > 0
      ? (faltam > 0 ? `Faltam ${moeda(faltam)}` : "Meta batida")
      : "Defina uma meta para este período.";
}

if (metaPercentual) {
  metaPercentual.textContent = `${percentual.toFixed(0)}%`;
}

if (barraMeta) {
  barraMeta.style.width = `${percentual}%`;
}

atualizarRelatorios(r);
aplicarStatusVisual(r);
atualizarDiagnostico(r, meta);
atualizarGrafico();
atualizarGraficoEvolucao();
 if (typeof atualizarGraficoEvolucao === "function") {
  atualizarGraficoEvolucao();
}
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
// BLOCO 26A — SIMULADOR / PARSER DE CHAMADas
// ===============================
// ---------- PARSER (ÚNICO E OFICIAL) ----------
function extrairDadosChamada(texto) {
  const textoLimpo = String(texto || "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const valorMatch = textoLimpo.match(/R\$\s?(\d+[.,]?\d*)/i);

  const kmMatches = [...textoLimpo.matchAll(/(\d+[.,]?\d*)\s?km/gi)];
  const tempoMatches = [...textoLimpo.matchAll(/(\d+[.,]?\d*)\s?(min|minutos)/gi)];

  const notaMatch =
    textoLimpo.match(/(\d+[.,]?\d*)\s?★/i) ||
    textoLimpo.match(/nota\s*:?\s*(\d+[.,]?\d*)/i);

  const kmTotal = kmMatches.reduce((t, v) => t + normalizarNumero(v[1]), 0);
  const tempoTotal = tempoMatches.reduce((t, v) => t + normalizarNumero(v[1]), 0);

  return {
    valor: valorMatch ? normalizarNumero(valorMatch[1]) : 0,
    km: kmTotal,
    tempo: tempoTotal,
    nota: notaMatch ? normalizarNumero(notaMatch[1]) : 5
  };
}

// ===============================
// BLOCO — NORMALIZAÇÃO + PARSER CORRIGIDO
// ===============================
function normalizarNumero(valorTexto) {
  if (!valorTexto) return 0;

  let valor = String(valorTexto)
    .replace("R$", "")
    .replace(/\s/g, "")
    .trim();

  if (valor.includes(".") && valor.includes(",")) {
    valor = valor.replace(/\./g, "").replace(",", ".");
  } else if (valor.includes(",")) {
    valor = valor.replace(",", ".");
  }

  return Number(valor);
}

// ---------- REGRAS DINÂMICAS ----------
function atualizarRegrasDoFormulario() {
  regras.valorKmMin = normalizarNumero(pegarElemento("regra-valor-km")?.value);
  regras.valorHoraMin = normalizarNumero(pegarElemento("regra-valor-hora")?.value);
  regras.kmMax = normalizarNumero(pegarElemento("regra-km-max")?.value);
  regras.notaMin = normalizarNumero(pegarElemento("regra-nota")?.value);

  localStorage.setItem("regras", JSON.stringify(regras));
}

// ---------- COR POR PERCENTUAL ----------
function getCor(percentual) {
  const pct = Math.min(Number(percentual || 0), 100);

  if (pct <= 30) return "vermelho";
  if (pct <= 49) return "amarelo";
  return "verde";
}

// ---------- MOTOR DE CÁLCULO ----------
function analisarChamada(valor, km, tempo, custoKm, nota = 5) {
  const valorKm = km > 0 ? valor / km : 0;
  const valorHora = tempo > 0 ? valor / (tempo / 60) : 0;

  const custo = km * custoKm;
  const lucro = valor - custo;

  return {
    valorKm,
    valorHora,
    custo,
    lucro
  };
}

function dataHojeISO() {
  return new Date().toISOString().split("T")[0];
}

function salvarHistoricoSimulador(item) {
  const hoje = dataHojeISO();
  let historico = JSON.parse(localStorage.getItem("historicoSimulador")) || [];

  historico = historico.filter(registro => registro.dataISO === hoje);

  historico.unshift({
    ...item,
    dataISO: hoje,
    hora: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  localStorage.setItem("historicoSimulador", JSON.stringify(historico));

  renderizarHistoricoChamadas();
}
// ---------- RENDER (SEMÁFORO) ----------
function renderizarResultadoSimulador(resultado, dados) {
  const alerta = pegarElemento("drive-alerta");
  if (!alerta) return;

  const regraKm = Number(regras.valorKmMin || 0);
  const regraHora = Number(regras.valorHoraMin || 0);
  const regraNota = Number(regras.notaMin || 0);

  const pctKm = regraKm ? (resultado.valorKm / regraKm) * 100 : 100;
  const pctHora = regraHora ? (resultado.valorHora / regraHora) * 100 : 100;
  const pctNota = regraNota ? (dados.nota / regraNota) * 100 : 100;

  const corKm = getCor(pctKm);
  const corHora = getCor(pctHora);
  const corNota = getCor(pctNota);

  const mediaFarol = Math.round(
  (
    Math.min(pctKm, 100) +
    Math.min(pctHora, 100) +
    Math.min(pctNota, 100)
  ) / 3
);

let decisaoFinal = "ACEITAR";

if (mediaFarol <= 30) {
  decisaoFinal = "RECUSAR";
} else if (mediaFarol <= 49) {
  decisaoFinal = "ANALISAR";
} else {
  decisaoFinal = "ACEITAR";
}

  alerta.classList.remove("oculto");

  alerta.innerHTML = `
    <div class="drive-carro">🚗</div>

    <div class="drive-card">
      <div class="drive-topo">
        <strong>DriveLucro</strong>
        <span>Análise da corrida</span>
      </div>

      <div class="drive-metricas">
        <div class="drive-item ${corKm}">
          <span>R$/km</span>
          <strong>${resultado.valorKm.toFixed(2)}</strong>
        </div>

        <div class="drive-item ${corHora}">
          <span>R$/hora</span>
          <strong>${resultado.valorHora.toFixed(2)}</strong>
        </div>

        <div class="drive-item ${corNota}">
          <span>Nota</span>
          <strong>${Number(dados.nota).toFixed(1)}</strong>
        </div>
      </div>

      <div class="drive-info">
        <span>${Number(dados.tempo).toFixed(0)} min</span>
        <span>${Number(dados.km).toFixed(1)} km</span>
      </div>

      <div class="drive-decisao ${decisaoFinal.toLowerCase()}">
        ${decisaoFinal}
      </div>
    </div>
  `;

  salvarHistoricoSimulador({
    decisao: decisaoFinal,
    valor: dados.valor,
    valorKm: resultado.valorKm,
    valorHora: resultado.valorHora,
    nota: dados.nota,
    km: dados.km,
    tempo: dados.tempo
  });

  clearTimeout(window.driveAlertaTimer);

  window.driveAlertaTimer = setTimeout(() => {
    alerta.classList.add("saindo");

    setTimeout(() => {
      alerta.classList.add("oculto");
      alerta.classList.remove("saindo");
      alerta.innerHTML = "";
    }, 700);
  }, 5000);
}
// ---------- SIMULADOR ----------
function configurarSimulador() {
  const form = pegarElemento("form-simulador");

  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    atualizarRegrasDoFormulario();

    const valor = normalizarNumero(pegarElemento("sim-valor")?.value);
    const km = normalizarNumero(pegarElemento("sim-km")?.value);
    const tempo = normalizarNumero(pegarElemento("sim-tempo")?.value);
    const nota = normalizarNumero(pegarElemento("sim-nota")?.value || 5);

    let custoKm = normalizarNumero(pegarElemento("sim-custo-km")?.value);

    if (!custoKm || custoKm <= 0) {
      custoKm = Number(dadosVeiculo?.custoKmReal || 0);
    }

    if (!valor || !km || !tempo) {
      alert("Preencha valor, km e tempo.");
      return;
    }

    const resultado = analisarChamada(valor, km, tempo, custoKm, nota);

    renderizarResultadoSimulador(resultado, {
      valor,
      km,
      tempo,
      nota
    });
  });
}

// ---------- PARSER AUTOMÁTICO ----------
function configurarParserChamada() {
  const textarea = pegarElemento("texto-chamada");
  const botao = pegarElemento("btn-processar-chamada");

  if (!textarea || !botao) return;

  botao.addEventListener("click", () => {
    const dados = extrairDadosChamada(textarea.value);

    if (!dados.valor || !dados.km || !dados.tempo) {
      alert("Não consegui ler a chamada.");
      return;
    }

    pegarElemento("sim-valor").value = dados.valor;
    pegarElemento("sim-km").value = dados.km;
    pegarElemento("sim-tempo").value = dados.tempo;
    pegarElemento("sim-nota").value = dados.nota;

    pegarElemento("form-simulador")
      .dispatchEvent(new Event("submit"));

    textarea.value = "";
  });
}

// BLOCO 43 — RESET PROFISSIONAL
// MANUTENÇÃO:
// Limpa completamente o sistema:
// corridas, custos, veículo, histórico, fechamentos e cache.
// ===============================
function configurarRelatorios() {
  const btnExportar = pegarElemento("btn-exportar");
  const btnLimpar = pegarElemento("btn-limpar-dados");

  if (btnExportar) {
    btnExportar.addEventListener("click", () => {
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
  }

  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      const confirmar = confirm(
        "Resetar o DriveLucro?\n\nIsso apagará TODOS os dados."
      );

      if (!confirmar) return;

      // Dados principais
      corridas = [];
      custos = [];
      historicoChamadas = [];
      historicoVeiculo = [];

      // Veículo
      dadosVeiculo = {
        custosFixos: 0,
        kmMensal: 0,
        combustivel: "Gasolina",
        valorAbastecido: 0,
        litros: 0,
        kmRodado: 0,
        custoKmReal: 0
      };

      // 🔥 LIMPEZA TOTAL DO STORAGE
      localStorage.clear();

      // 🔥 LIMPEZA DE CAMPOS VISUAIS
      limparCamposVeiculo();

      renderizar();
      atualizarDashboard();
      abrirTela("dashboard");

      alert("Sistema resetado com sucesso.");
    });
  }
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
// ===============================
// BLOCO PREMIUM 02 — VELOCÍMETRO DE DESEMPENHO
// MANUTENÇÃO:
// Substitui o gráfico comum por um velocímetro estilo painel de carro.
// Mede desempenho com base no lucro real do período.
// Vermelho = prejuízo | Amarelo = atenção | Verde = lucro.
// ===============================
function atualizarGrafico() {
  const canvas = pegarElemento("grafico-financeiro");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const r = calcularResumo();

  canvas.width = canvas.parentElement.clientWidth - 24;
  canvas.height = 260;

  const centroX = canvas.width / 2;
  const centroY = 185;
  const raio = Math.min(canvas.width / 2 - 35, 105);

  const lucro = Number(r.lucro || 0);
  const faturamento = Number(r.faturamento || 0);

  let desempenho = 0;

  if (faturamento > 0) {
    desempenho = Math.max(0, Math.min(100, ((lucro / faturamento) * 100) + 50));
  }

  const anguloInicio = Math.PI;
  const anguloFim = 2 * Math.PI;
  const anguloAtual = anguloInicio + (desempenho / 100) * Math.PI;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fundo do painel
  ctx.beginPath();
  ctx.arc(centroX, centroY, raio + 18, Math.PI, 2 * Math.PI);
  ctx.lineWidth = 22;
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.stroke();

  // Zona vermelha
  ctx.beginPath();
  ctx.arc(centroX, centroY, raio, Math.PI, Math.PI * 1.33);
  ctx.lineWidth = 18;
  ctx.strokeStyle = "#ef4444";
  ctx.stroke();

  // Zona amarela
  ctx.beginPath();
  ctx.arc(centroX, centroY, raio, Math.PI * 1.33, Math.PI * 1.66);
  ctx.lineWidth = 18;
  ctx.strokeStyle = "#facc15";
  ctx.stroke();

  // Zona verde
  ctx.beginPath();
  ctx.arc(centroX, centroY, raio, Math.PI * 1.66, Math.PI * 2);
  ctx.lineWidth = 18;
  ctx.strokeStyle = "#7CFC00";
  ctx.stroke();

  // Marcas
  for (let i = 0; i <= 10; i++) {
    const ang = Math.PI + (i / 10) * Math.PI;
    const x1 = centroX + Math.cos(ang) * (raio - 18);
    const y1 = centroY + Math.sin(ang) * (raio - 18);
    const x2 = centroX + Math.cos(ang) * (raio - 4);
    const y2 = centroY + Math.sin(ang) * (raio - 4);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.stroke();
  }

  // Ponteiro
  const ponteiroX = centroX + Math.cos(anguloAtual) * (raio - 28);
  const ponteiroY = centroY + Math.sin(anguloAtual) * (raio - 28);

  ctx.beginPath();
  ctx.moveTo(centroX, centroY);
  ctx.lineTo(ponteiroX, ponteiroY);
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.strokeStyle = lucro >= 0 ? "#7CFC00" : "#ef4444";
  ctx.shadowColor = lucro >= 0 ? "#7CFC00" : "#ef4444";
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Centro
  ctx.beginPath();
  ctx.arc(centroX, centroY, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();

  // Texto principal
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(desempenho)}%`, centroX, centroY - 56);

  ctx.font = "bold 14px Arial";
  ctx.fillStyle = lucro >= 0 ? "#7CFC00" : "#ef4444";
  ctx.fillText(lucro >= 0 ? "LUCRO" : "PREJUÍZO", centroX, centroY - 32);

  ctx.font = "13px Arial";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`Resultado: ${moeda(lucro)}`, centroX, centroY + 36);
}

// ===============================
// BLOCO PREMIUM 04 — EVOLUÇÃO INTELIGENTE
// MANUTENÇÃO:
// Cria um painel de evolução simples e seguro.
// Mostra faturamento acumulado por dia no período selecionado.
// ===============================
function atualizarGraficoEvolucao() {
  const canvas = pegarElemento("grafico-evolucao");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const corridasPeriodo = filtrarPorPeriodo(corridas);

  canvas.width = canvas.parentElement.clientWidth - 24;
  canvas.height = 240;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!corridasPeriodo.length) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Sem dados para evolução", canvas.width / 2, 120);
    return;
  }

  const agrupado = {};

  corridasPeriodo.forEach(corrida => {
    const data = corrida.data || dataHoje();

    if (!agrupado[data]) agrupado[data] = 0;
    agrupado[data] += Number(corrida.valor || 0);
  });

  const valores = Object.values(agrupado);
  const labels = Object.keys(agrupado);

  const maior = Math.max(...valores, 1);
  const padding = 34;
  const baseY = canvas.height - 42;
  const alturaMax = canvas.height - 90;
  const larguraUtil = canvas.width - padding * 2;

  ctx.strokeStyle = "rgba(124,252,0,0.18)";
  ctx.lineWidth = 1;

  for (let i = 0; i < 4; i++) {
    const y = baseY - (alturaMax / 3) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();
  }

  const pontos = valores.map((valor, index) => {
    const x = valores.length === 1
      ? canvas.width / 2
      : padding + (index * larguraUtil) / (valores.length - 1);

    const y = baseY - (valor / maior) * alturaMax;

    return { x, y, valor, label: labels[index] };
  });

  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grad.addColorStop(0, "#7CFC00");
  grad.addColorStop(1, "#22c55e");

  ctx.beginPath();
  pontos.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.strokeStyle = grad;
  ctx.lineWidth = 4;
  ctx.shadowColor = "#7CFC00";
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  pontos.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#7CFC00";
    ctx.fill();

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(moeda(p.valor), p.x, p.y - 12);
  });

  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Evolução do faturamento por período", canvas.width / 2, canvas.height - 12);
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
  if (!box) return;

  const hoje = dataHojeISO();
  let historico = JSON.parse(localStorage.getItem("historicoSimulador")) || [];

  historico = historico.filter(item => item.dataISO === hoje);
  localStorage.setItem("historicoSimulador", JSON.stringify(historico));

  if (!historico.length) {
    box.innerHTML = "<p>Nenhuma chamada analisada ainda.</p>";
    return;
  }

  box.innerHTML = historico.map(item => `
    <div class="historico-chamada-item">
      <strong>${item.hora} — ${item.decisao}</strong>
      <p>R$/km: ${Number(item.valorKm).toFixed(2)} • R$/hora: ${Number(item.valorHora).toFixed(2)}</p>
      <p>${Number(item.tempo).toFixed(0)} min • ${Number(item.km).toFixed(1)} km • Nota ${Number(item.nota).toFixed(1)}</p>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", init);
// ===============================
// BLOCO 30 — CONTROLE DRAWER
// MANUTENÇÃO:
// Abre e fecha o menu lateral.
// Usa os IDs obrigatórios: btn-menu, drawer e overlay.
// ===============================
function configurarDrawer() {
  const btnMenu = pegarElemento("btn-menu");
  const drawer = pegarElemento("drawer");
  const overlay = pegarElemento("overlay");

  if (!btnMenu || !drawer || !overlay) {
    console.warn("Drawer não iniciado: btn-menu, drawer ou overlay não encontrado.");
    return;
  }

  btnMenu.addEventListener("click", () => {
    drawer.classList.toggle("ativo");
    overlay.classList.toggle("ativo");
  });

  overlay.addEventListener("click", () => {
    drawer.classList.remove("ativo");
    overlay.classList.remove("ativo");
  });

  document.querySelectorAll(".drawer-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const tela = btn.dataset.tela;

      if (tela) abrirTela(tela);

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
// MANUTENÇÃO:
// Calcula o lucro real usando o KM real do odômetro.
// Fórmula:
// lucro real = faturamento - custos variáveis - custo real do carro.
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
    alert("Configure primeiro o custo/km em Meu Veículo.");
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
// MANUTENÇÃO:
// Salva um único fechamento por dia.
// Se já existir fechamento na mesma data, substitui pelo mais recente.
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
// MANUTENÇÃO:
// Lê os fechamentos salvos e soma conforme o filtro ativo:
// dia, semana, mês ou ano.
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
