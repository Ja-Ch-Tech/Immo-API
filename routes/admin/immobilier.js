var express = require('express');
var router = express.Router();

var model = require("../../models/admin/immobilier");
var db = require("../../models/db");

router.get("/getNotValidate/:id", (req, res) => {
    var objetRetour = require("../objet_retour").ObjetRetour();

    model.initialize(db);
    model.getAllNotValidate(req.params.id, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

router.get("/toggleValidation/:id_admin/:id_immo", (req, res) => {
    var objetRetour = require("../objet_retour").ObjetRetour();

    model.initialize(db);
    model.toggleTagValid(req.params.id_admin, req.params.id_immo, (isToggle, message, result) => {
        objetRetour.getEtat = isToggle;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

router.get("/count/:id_admin", (req, res) => {
    var objetRetour = require("../objet_retour").ObjetRetour();

    model.initialize(db);
    model.countImmovable(req.params.id_admin, (isCount, message, result) => {
        objetRetour.getEtat = isCount;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

module.exports = router;