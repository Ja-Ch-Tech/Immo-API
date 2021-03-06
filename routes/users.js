var express = require('express');
var router = express.Router();

var model = require("../models/users");
var db = require("../models/db");

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//Pour l'inscription de n'importe quel client ---> Client ou Proprio
router.post('/register', (req, res) => {
    var entity = require("../models/entities/users").User(),
        objetRetour = require("./objet_retour").ObjetRetour();

    //For user
    entity.nom = req.body.nom;
    entity.prenom = req.body.prenom;
    entity.type = req.body.type;
    entity.login.username = req.body.username;
    entity.login.password = req.body.password;

    model.initialize(db);
    model.create(entity, (isCreated, message, result) => {

        objetRetour.getEtat = isCreated;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

//Connexion au site
router.post('/login', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    model.initialize(db);
    model.login(req.body.username, req.body.password, (isLogged, message, result) => {
        objetRetour.getEtat = isLogged;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

//Permet de définir ou de mettre à jour une adresse
router.post('/setAdress/:id_user', (req, res) => {
    var entity = require("../models/entities/adresse").Adresse(),
        objetRetour = require("./objet_retour").ObjetRetour();

    entity.commune = req.body.commune;
    entity.avenue = req.body.avenue;
    entity.numero = req.body.numero;
    entity.reference = req.body.ref ? req.body.ref : null;
    entity.quartier = req.body.quartier ? req.body.quartier : null;

    model.initialize(db);
    model.upAdresse(req.params.id_user, entity, (isUp, message, result) => {
        objetRetour.getEtat = isUp;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })

})

//Permet de définir ou de mettre à jour le profil de l'utilisateur
router.post('/upProfil', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour(),
        objet = {
            "id": req.body.id,
            "nom": req.body.nom,
            "prenom": req.body.prenom,
            "username": req.body.username,
        };

    model.initialize(db);
    model.upProfil(objet, (isUp, message, result) => {
        
        objetRetour.getEtat = isUp;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })

})

//Permet de définir ou de mettre à jour le contact
router.post('/setContact', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour(),
        objet = {
            "id": req.body.id,
            "telephone": req.body.telephone,
            "email": req.body.email
        };

    model.initialize(db);
    model.setContact(objet, (isSet, message, result) => {

        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })

})

//Permet de définir ou de mettre à jour le profil de l'utilisateur
router.post('/upPassword', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour(),
        objet = {
            "id": req.body.id,
            "oldPassword": req.body.ancienMdp,
            "newPassword": req.body.nouveauMdp
        };

    model.initialize(db);
    model.upProfil(objet, (isUp, message, result) => {

        objetRetour.getEtat = isUp;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })

})

//Pour définir l'image
router.post('/setImage', (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    var props = {
        "id_user": req.body.id_user,
        "name": req.body.name,
        "size": req.body.size,
        "path": req.body.path,
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

//Récupère les infos du owner
router.get("/infoOwner/:id", (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour(),
        objet = {
            "id_user": req.params.id
        };
    
    model.initialize(db);
    model.getInfoOwner(objet, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

//Récupère les infos de n'importe quel user
router.get("/infoForAnyUser/:id", (req, res) => {
    var objetRetour = require("./objet_retour").ObjetRetour();

    model.initialize(db);
    model.getInfoForAnyUser(req.params.id, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

module.exports = router;
