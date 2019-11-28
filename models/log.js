//Appelle à la base de données
var db = require("./db");

var collection = {
    value: null
}

module.exports.initialize = function (db_js) {

    collection.value = db_js.get().collection("logs");
}

//Module pour la sauvegarde des recherches non-trouvés
module.exports.saveSearch = (searchNotFound, callback) => {
    try {
        searchNotFound.id_user = searchNotFound.id_user ? searchNotFound.id_user : null;
        collection.value.insertOne(searchNotFound, (err, result) => {
            if (err) {
                callback(false, "Une erreur est survenue lors de la sauvegarde de la recherche : " + err)
            } else {
                if (result) {
                    callback(true, "La sauvegarde a réussi, nous prevenons tous les bailleurs pour qu'ils puissent ajouté cela", result.ops[0])
                } else {
                    callback(false, "La recherche n'a pas pu aboutir")
                }
            }
        })
    } catch (exception) {
        callback(false, "Une exception a été lévée lors de la sauvegarde de la recherche : " + exception)
    }
}