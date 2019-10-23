var express = require('express');
var router = express.Router();

var model = require("../models/media");
var db = require("../models/db");

router.post("/create", (req, res) => {
    var entity = require("../models/entities/media").Media(),
        objetRetour = require("./objet_retour").ObjetRetour();

    entity.name = req.body.name;
    entity.path = req.body.path;
    entity.size = req.body.size;

    model.initialize(db);
    model.create(entity, (isCreated, message, result) => {
        objetRetour.getEtat = isCreated;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

module.exports = router;