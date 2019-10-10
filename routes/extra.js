var express = require('express');
var router = express.Router();

var model = require("../models/extra");
var db = require("../models/db");

//Dès lors qu'on est intéréssé
router.post('/interest', (req, res) => {
    
    var entity = require("../models/entities/extra").Interest(),
        objetRetour = require("./objet_retour").ObjetRetour();

    entity.id_owner = req.body.id_owner;
    entity.id_user = req.body.id_user;

    model.initialize(db);
    model.SetInterest(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

module.exports = router;