var express = require('express');
var router = express.Router();

var model = require("../../models/admin/notification");
var db = require("../../models/db");

router.get("/:id/:limit", (req, res) => {
    var objetRetour = require("../objet_retour").ObjetRetour();

    model.initialize(db);
    model.getNotification(req.params.id, req.params.limit ? parseInt(req.params.limit) : null, (isGet, message, result) => {
        objetRetour.getEtat = isGet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

router.post("/setRead/:id_admin/:id_notif", (req, res) => {
    var objetRetour = require("../objet_retour").ObjetRetour();

    model.initialize(db);
    model.setRead(req.params.id_admin, req.params.id_notif, (isSet, message, result) => {
        objetRetour.getEtat = isSet;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

module.exports = router;