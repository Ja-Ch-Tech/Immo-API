var express = require('express');
var router = express.Router();

var model = require("../models/immobilier");
var db = require("../models/db");


//Pour publier un immobilier
router.post('/publish', (req, res) => {
    var entity = require("../models/entities/immobilier").Immobilier(),
        entitySecondary = require("../models/entities/adresse").Adresse(),
        objetRetour = require("./objet_retour").ObjetRetour();

    //For adresse
    entitySecondary.commune = req.body.commune;
    entitySecondary.avenue = req.body.avenue;
    entitySecondary.numero = req.body.numero;
    entitySecondary.reference = req.body.reference ? req.body.reference : null;

    //For immobilier
    entity.id_user = req.body.id_user;
    entity.id_mode_immo = req.body.id_mode_immo;
    entity.id_type_immo = req.body.id_type_immo;
    entity.nbrePiece = req.body.nbrePiece;
    entity.nbreChambre = req.body.nbreChambre;
    entity.nbreDouche = req.body.nbreDouche;
    entity.prix = req.body.prix;
    entity.surface = req.body.surface;
    entity.description = req.body.description;

    model.initialize(db);
    model.publish(entity, entitySecondary, (isCreated, message, result) => {
        objetRetour.getEtat = isCreated;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

//Pour la définition des images d'un immobilier
router.post('/setImages', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    var props = {
        "id_immo": req.body.id_immo,
        "images": req.body.images
    }

    model.initialize(db);
    model.setImage(props, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

//Pour les stats des types
router.get('/getStatType', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    model.initialize(db);
    model.getDetailsForType((isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

//Pour les nouvelles publications
router.get('/getNew/:limit', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    model.initialize(db);
    model.getNewImmobilier(parseInt(req.params.limit), (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

module.exports = router;