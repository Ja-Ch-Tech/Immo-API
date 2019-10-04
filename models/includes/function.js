//By Frdrcpeter
"use strict";

//#region Commande
/**
 * Module de sauvegarde de la commande
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.saveCommande = function saveCommande(database, modelCommande, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        commande_entity = require("../entities/commande_entity").Commande(),
        sortieProduit = 0,
        productSave = [];

    request.body.cart.forEach((produit, item, tab) => {
        
        sortieProduit++;
        if (produit.id && produit.count != 0) {
            
            productSave.push({
                "id_produit": produit.id,
                "quantite": produit.count ? parseInt(produit.count, 10) : 0
            });
        }
        
        if (sortieProduit == request.body.cart.length) {
            commande_entity.produit = productSave;
        }
        
    }, this);
    
    commande_entity.adresse = request.body.adresse;

    let details = {
        "nom": request.body.nom,
        "email": request.body.email,
        "telephone": request.body.tel
    }
    
    commande_entity.details = details;
    commande_entity.paiement = commande_entity.paiement ? commande_entity.paiement : "Paiement Cash";

    modelCommande.initialize(database);
    modelCommande.create(commande_entity, (isCreated, messageCommande, resultCommande) => {
        if (isCreated) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultCommande;
            objetRetour.getMessage = messageCommande;
            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getObjet = resultCommande;
            objetRetour.getMessage = messageCommande;
            response.send(objetRetour);
        }
    })
}

/**
 * Module permettant de dire à l'application qu'il a été arrivé
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelCommande Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.setSuccessfullyDelivered = function setSuccessfullyDelivered(database, modelCommande, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        id_commande = request.params.id_commande;
    
    modelCommande.initialize(database);
    modelCommande.successfullyDelivered(id_commande, (isSet, messageCommande, resultCommande) => {
        if (isSet) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultCommande;
            objetRetour.getMessage = messageCommande;
            response.send(objetRetour);
        } else {
            objetRetour.getEtat = false;
            objetRetour.getObjet = resultCommande;
            objetRetour.getMessage = messageCommande;
            response.send(objetRetour);
        }
    })
}
//#endregion

//#region Produit
/**
 * Module d'ajout d'un produit
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelProduct Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.addProduct = function addProduct(database, modelProduct, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        produit_entity = require("../entities/produit_entity").Produit();

    produit_entity.intitule = request.body.intitule;
    produit_entity.annotation = request.body.annotation;
    produit_entity.pu = request.body.pu;
    
    modelProduct.initialize(database);
    modelProduct.create(produit_entity, (isCreated, messageProduct, resultProduct) => {
        if (isCreated) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultProduct;
            objetRetour.getMessage = messageProduct;
            response.send(objetRetour); 
        } else {
            objetRetour.getEtat = false;
            objetRetour.getObjet = resultProduct;
            objetRetour.getMessage = messageProduct;
            response.send(objetRetour);
        }
    })
}

/**
 * Module de récupération d'un produit
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelProduct Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getNewProduct = function getNewProduct(database, modelProduct, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        limit = parseInt(request.params.limit, 10);
    
    modelProduct.initialize(database);
    modelProduct.getNewProduct(limit, (isCreated, messageProduct, resultProduct) => {
        if (isCreated) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultProduct;
            objetRetour.getMessage = messageProduct;
            response.send(objetRetour); 
        } else {
            objetRetour.getEtat = false;
            objetRetour.getObjet = resultProduct;
            objetRetour.getMessage = messageProduct;
            response.send(objetRetour);
        }
    })
}

/**
 * Module de définir l'image d'un produit
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelProduct Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.setImageProduct = function setImageProduct(database, modelProduct, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        props = {
            "id_produit": request.body.id_produit,
            "id_media": request.body.id_media
        };
    
    modelProduct.initialize(database);
    modelProduct.setImage(props, (isSet, messageProduct, resultProduct) => {
        if (isSet) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultProduct;
            objetRetour.getMessage = messageProduct;
            response.send(objetRetour); 
        } else {
            objetRetour.getEtat = false;
            objetRetour.getObjet = resultProduct;
            objetRetour.getMessage = messageProduct;
            response.send(objetRetour);
        }
    })
}

/**
 * Module de récupération d'un produit
 * @param {*} database Introduisez la variable qui nous connecte à la base de données 
 * @param {*} modelProduct Introduisez la variable contenant le model de la table ou de l'objet  
 * @param {*} request Variable qui envoi des requête
 * @param {*} response Variable qui fournit la reponse
 */
module.exports.getTopProduct = function getTopProduct(database, modelProduct, request, response) {

    //On appel les modules necessaire pour cette fonction
    var objetRetour = require("../../routes/objet_retour").ObjetRetour(),
        limit = parseInt(request.params.limit, 10);
    
    modelProduct.initialize(database);
    modelProduct.getTop(limit, (isCreated, messageProduct, resultProduct) => {
        if (isCreated) {
            objetRetour.getEtat = true;
            objetRetour.getObjet = resultProduct;
            objetRetour.getMessage = messageProduct;
            response.send(objetRetour); 
        } else {
            objetRetour.getEtat = false;
            objetRetour.getObjet = resultProduct;
            objetRetour.getMessage = messageProduct;
            response.send(objetRetour);
        }
    })
}
//#endregion