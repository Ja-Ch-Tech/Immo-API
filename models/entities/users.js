module.exports.User = function User() {
    return {
        nom: String,
        prenom: String,
        lien_profil: String,
        id_adresse: String,
        type: String,
        login: {
            username: String,
            password: String
        }
    }
}