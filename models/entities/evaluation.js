module.exports.StarEvaluation = function StarEvaluation() {
    return {
        "id_user": String,
        "id_immo": String,
        "id_owner": String,
        "type": "Star",
        "evaluation": Array,
        "created_at": new Date()
    }
}

module.exports.ViewEvaluation = function ViewEvaluation() {
    return {
        "type": "View",
        "id_user": String,
        "id_immo": String,
        "id_owner": String,
        "created_at": new Date()
    }
}