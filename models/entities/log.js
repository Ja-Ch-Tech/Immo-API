/**
 * Entité pour le journal des recherches non-trouvé
 */
module.exports.Search = function Search() {
    return {
        "typeSearch": "Search",
        "mode": String,
        "typeImmo": String,
        "locationAndOtherParams": {
            "commune": String,
            "piece": String,
            "minPrice": Number,
            "maxPrice": Number,
            "nbreBadRoom": Number
        },
        "id_user": String,
        "created_at": new Date()
    }
}

/* Le log pour chaque login */
module.exports.Login = function Login() {
    return {
        "type": "Login",
        "id_user": String,
        "history": []
    }
}