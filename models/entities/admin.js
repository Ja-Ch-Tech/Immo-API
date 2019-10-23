module.exports.Admin = function Admin() {
    return{
        "username": String,
        "password": String,
        "create_by": String,
        "created_at": new Date(),
        "flag": true
    }
}