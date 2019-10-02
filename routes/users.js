var express = require('express');
var router = express.Router();

var model = require("../models/users");
var db = require("../models/db");

/* GET users listing. */
router.get('/', function(req, res, next) {
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

    model.initialize(db);
    model.upAdresse(req.params.id_user, entity, (isUp, message, result) => {
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
        "id_media": req.body.id_media
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

module.exports = router;
