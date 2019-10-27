var express = require('express');
var router = express.Router();

var model = require("../../models/admin/admin");
var db = require("../../models/db");

//Pour l'inscription de n'importe quel adminisatrateur;
router.post('/register', (req, res) => {
    var entity = require("../../models/entities/admin").Admin(),
        objetRetour = require("../objet_retour").ObjetRetour();

    //For Admin
    entity.username = req.body.username;
    entity.password = req.body.password;
    entity.create_by = req.body.create_by;

    model.initialize(db);
    model.create(entity, (isCreated, message, result) => {

        objetRetour.getEtat = isCreated;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

router.post('/login', (req, res) => {
    var objetRetour = require("../objet_retour").ObjetRetour();

    model.initialize(db);
    model.login(req.body.username, req.body.pswd, (isLogged, message, result) => {
        objetRetour.getEtat = isLogged;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})
module.exports = router;