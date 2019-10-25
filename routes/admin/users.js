var express = require('express');
var router = express.Router();

var model = require("../../models/admin/users");
var db = require("../../models/db");

router.get("/count/:id_admin", (req, res) => {
    var objetRetour = require("../objet_retour").ObjetRetour();

    model.initialize(db);
    model.countUsers(req.params.id_admin, (isCount, message, result) => {
        objetRetour.getEtat = isCount;
        objetRetour.getMessage = message;
        objetRetour.getObjet = result;

        res.status(200);
        res.send(objetRetour);
    })
})

module.exports = router;