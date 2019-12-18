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
    entity.id_immo = req.body.id_immo;

    model.initialize(db);
    model.SetInterest(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

router.get('/listUserInterest/:id_immo/:id_admin', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour(),
        objet = {
            "id_immo": req.params.id_immo
        },
        id_admin = req.params.id_admin && req.params.id_admin != "null" ? req.params.id_admin : null;

    model.initialize(db);
    model.listUserInterestToImmo(objet, id_admin, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })

})

//Route permettant de lister les préferences des l'utilisateurs
router.get('/listImmoAddToExtraForUserAccordingType/:id_user/:type', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    model.initialize(db);
    model.listImmoAddToExtraForUserAccordingType(req.params.id_user, parseInt(req.params.type), (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

//Route permettant de mettre en favoris
router.post('/setInFavorite', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour(),
        entity = require("../models/entities/extra").Favorite();

    entity.id_immo = req.body.id_immo;
    entity.id_user = req.body.id_user;

    model.initialize(db);
    model.SetFavorite(entity, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

module.exports = router;