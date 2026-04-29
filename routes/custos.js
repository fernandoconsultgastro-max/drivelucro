const express = require("express");
const router = express.Router();

const custosController = require("../controllers/custosController");

router.get("/", custosController.listarCustos);
router.post("/", custosController.criarCusto);
router.delete("/:id", custosController.excluirCusto);
router.get("/resumo", custosController.resumoCustos);

module.exports = router;