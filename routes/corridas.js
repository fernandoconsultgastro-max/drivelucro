const express = require("express");
const router = express.Router();

const corridasController = require("../controllers/corridasController");

router.get("/", corridasController.listarCorridas);
router.post("/", corridasController.criarCorrida);
router.delete("/:id", corridasController.excluirCorrida);
router.get("/resumo", corridasController.resumoCorridas);

module.exports = router;