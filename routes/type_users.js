var express = require('express');
var router = express.Router();

var model = require("../models/type_users");
var db = require("../models/db");


//Pour créer des types, utilisables pour l'admin
router.post('/create', (req, res) => {
    var entity = require("../models/entities/type_users").TypeUsers(),
        objetRetour = require("./objet_retour").ObjetRetour();

    entity.intitule = req.body.intitule;

    model.initialize(db);
    model.create(entity, (isCreated, message, result) => {
        objetRetour.getEtat = isCreated;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

//Récupération de type pour le mettre dans un combo
router.get('/getAll', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    model.initialize(db);
    model.getAll((isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour)
    })
})

module.exports = router;