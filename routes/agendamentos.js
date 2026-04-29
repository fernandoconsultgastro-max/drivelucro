const express = require("express");
const router = express.Router();

const agendamentosController = require("../controllers/agendamentosController");

router.get("/", agendamentosController.listarAgendamentos);
router.post("/", agendamentosController.criarAgendamento);
router.patch("/:id/status", agendamentosController.atualizarStatus);
router.delete("/:id", agendamentosController.excluirAgendamento);

module.exports = router;