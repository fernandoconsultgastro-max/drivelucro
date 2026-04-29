const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/custos.json");

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

exports.listarCustos = (req, res) => {
  const custos = lerDados();
  res.json(custos);
};

exports.criarCusto = (req, res) => {
  const custos = lerDados();

  const novoCusto = {
    id: Date.now(),
    data: req.body.data,
    categoria: req.body.categoria || "",
    descricao: req.body.descricao || "",
    valor: Number(req.body.valor || 0),
    km_referencia: Number(req.body.km_referencia || 0),
    observacao: req.body.observacao || ""
  };

  custos.push(novoCusto);
  salvarDados(custos);

  res.status(201).json(novoCusto);
};

exports.excluirCusto = (req, res) => {
  const custos = lerDados();
  const id = Number(req.params.id);

  const novosCustos = custos.filter((custo) => custo.id !== id);
  salvarDados(novosCustos);

  res.json({ mensagem: "Custo excluído com sucesso." });
};

exports.resumoCustos = (req, res) => {
  const custos = lerDados();

  const totalCustos = custos.reduce((total, custo) => total + Number(custo.valor || 0), 0);

  res.json({
    total_lancamentos: custos.length,
    total_custos: totalCustos
  });
};