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

module.exports = router;