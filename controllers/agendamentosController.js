const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/agendamentos.json");

function lerDados() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }

  const conteudo = fs.readFileSync(filePath, "utf8");
  return conteudo ? JSON.parse(conteudo) : [];
}

function salvarDados(dados) {
  fs.writeFileSync(filePath, JSON.stringify(dados, null, 2));
}

exports.listarAgendamentos = (req, res) => {
  const agendamentos = lerDados();
  res.json(agendamentos);
};

exports.criarAgendamento = (req, res) => {
  const agendamentos = lerDados();

  const novoAgendamento = {
    id: Date.now(),
    nome: req.body.nome || "",
    telefone: req.body.telefone || "",
    origem: req.body.origem || "",
    destino: req.body.destino || "",
    data: req.body.data || "",
    horario: req.body.horario || "",
    tipo_viagem: req.body.tipo_viagem || "",
    observacao: req.body.observacao || "",
    status: "pendente"
  };

  agendamentos.push(novoAgendamento);
  salvarDados(agendamentos);

  res.status(201).json(novoAgendamento);
};

exports.atualizarStatus = (req, res) => {
  const agendamentos = lerDados();
  const id = Number(req.params.id);

  const agendamento = agendamentos.find((item) => item.id === id);

  if (!agendamento) {
    return res.status(404).json({ erro: "Agendamento não encontrado." });
  }

  agendamento.status = req.body.status || agendamento.status;

  salvarDados(agendamentos);

  res.json(agendamento);
};

exports.excluirAgendamento = (req, res) => {
  const agendamentos = lerDados();
  const id = Number(req.params.id);

  const novosAgendamentos = agendamentos.filter((item) => item.id !== id);
  salvarDados(novosAgendamentos);

  res.json({ mensagem: "Agendamento excluído com sucesso." });
};