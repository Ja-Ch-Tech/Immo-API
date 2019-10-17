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

//Pour les publications d'un propriétaire
router.get('/getAllByModeForOwner/:id_user', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour(),
        objet = {
            "id_user": req.params.id_user
        };

    model.initialize(db);
    model.getAllImmovableForOwner(objet, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

//Pour les publications par modes
router.get('/getAllByMode/:id', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour(),
        mode = {
            "id": req.params.id
        };

    model.initialize(db);
    model.getImmobilierByMode(mode, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})


//Pour les publications pour un type
router.get('/getAllForType/:id', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    model.initialize(db);
    model.getImmovableForType(req.params.id, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

//Pour les publications par modes
router.get('/getDetails/:id_immo', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    model.initialize(db);
    model.getDetailsForImmovable(req.params.id_immo, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

router.post('/search', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    var params = {
        mode: req.body.mode,
        type: req.body.type,
        commune: req.body.commune,
        piece: req.body.nbrePiece,
        maxAmount: parseInt(req.body.montantMax),
        minAmount: parseInt(req.body.montantMin),
        bathroom: req.body.nbreChambre
    }

    model.initialize(db);
    model.smartFind(params.mode, params.type, params.commune, params.piece, params.maxAmount, params.minAmount, params.bathroom, (isFound, message, result) => {
        objetRetour.getEtat = isFound;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})
module.exports = router;