var express = require('express');
var router = express.Router();
var multer = require("multer");
var fs = require("fs");
var Jimp = require("jimp");
var aws = require("aws-sdk");
var multerS3 = require('multer-s3');


//aws.config.region = "US East (Ohio)";

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'IMMOBILIER' });
});


//La router permettant de téléverser les images
router.post("/upload_image/:type_media/:folder", (req, res) => {
  
    //On déclare et assigne les variables globales
    var folder = req.params.folder,
        type_media = req.params.type_media,
        destination_value_temp = null,
        destination_value = null,
        objetRetour = require("./objet_retour").ObjetRetour();

    switch (type_media) {
        case "users":
            destination_value_temp = 'public/images/users/' + folder + '/temp';
            destination_value = 'public/images/users/' + folder;
            break;
        case "immobiliers":
            destination_value_temp = 'public/images/immobiliers/' + folder + '/temp';
            destination_value = 'public/images/immobiliers/' + folder;
        default:

            break;
    }

    if (destination_value != null && destination_value_temp != null) {
        handleMedia(type_media, destination_value_temp, destination_value, objetRetour, req, res);
    } else {
        objetRetour.getEtat = false;
        objetRetour.getMessage = "La valeur du type média est incorrecte";
        res.send(objetRetour);
    }


})

/**
 * La fonction permettant de traiter le média
 */
function handleMedia(type_media, destination_value_temp, destination_value, objetRetour, req, res) {

    //On déclare le paramètre de stockage
    var storage = multer.diskStorage({
        destination: destination_value_temp, //dossier temporaire
        filename: function (req, file, cb) { //personnalisation du nom du fichier
            var file_name = Date.now() + "_" + file.originalname;
            cb(null, file_name);
        }
    });

    //On déclare la variable "upload" ayant comme valeur une instance du module "muler"
    var upload = multer({ storage: storage }).any();

    //On procède au téléversement du fichier
    upload(req, res, function (err) {
        if (err) {//Si une erreur survient lors du téléversement

            objetRetour.getEtat = false;
            objetRetour.getMessage = "Une erreur est survenue lors du  téléversement du fichier : " + err;
            res.send(objetRetour)

        } else {//Si non aucune erreur n'est survenue lors du téléversement

            if (req.files) {//On vérifie s'il y a bien au moins un fichier dans la rêquetes

                var listeMedia = [],
                    sortieMedia = 0;

                req.files.forEach(function (file, index, tabFile) { //On passe en boucle les fichiers soumis dans la requête

                    //On incrémente la variable de sortie
                    sortieMedia++;

                    //On crée une instance de l'entité "Media"
                    var fichier = require("../models/entities/media").Media();

                    //instance à laquelle on attribue le nom du fichier comme valeur de la propriété "name"
                    fichier.name = file.filename;
                    fichier.size = file.size;

                    //on insère cette instance dans la liste de média à traiter
                    listeMedia.push(fichier);

                    if (tabFile.length == sortieMedia) {//On vérifie la condition de sortie de la boucle

                        var sortie_tab_file = 0,
                            list_retour = [],
                            list_retour_erreur = [];

                        listeMedia.forEach(function (file, index_file, tab_file) {//Pour chaque item dans la liste de média à traiter

                            //On procède au traitement
                            compressImage(destination_value_temp, destination_value, file, type_media, function (isCompressed, resultCompressing) {

                                sortie_tab_file++;

                                if (isCompressed) {
                                    list_retour.push(resultCompressing)
                                } else {
                                    list_retour_erreur.push(resultCompressing)
                                }

                                if (sortie_tab_file == tab_file.length) {

                                    if (list_retour.length > 0) {
                                        objetRetour.getEtat = true;
                                        objetRetour.getObjet = list_retour;

                                        res.send(objetRetour)
                                    } else {
                                        objetRetour.getEtat = false;
                                        objetRetour.getMessage = list_retour_erreur;

                                        res.send(objetRetour)
                                    }
                                }

                            })

                        })

                    }

                })

            } else { //Sinon la requête ne possède aucun fichier

                objetRetour.getMessage = "Le fichier n'a pas été téléversé";
                objetRetour.getEtat = false;
                res.send(objetRetour);
            }
        }
    })

}

/**
 * La fonction permettant de rédimensionner une image
 * @param {*} image_path_inner 
 * @param {*} image_path_outter 
 * @param {*} image_file 
 * @param {*} callback 
 */
function resizeImage(image_path_inner, image_path_outter, image_file, type_media, callback) {

    //On lis le fichier
    Jimp.read(image_path_inner + "/" + image_file.name, function (err, image_mobile) {
        if (err) {//Si une erreur survenait lors de la lecture du fichier
            console.log(err);
        } else {//Sinon la lecture s'est effectuée avec succès

            //Sachant qu'ici l'opération consiste à rédimensionner le fichier, on commence par
            //appeler le module nous permettant de recupérer les dimensions du fichier
            var sizeOf = require("image-size");

            sizeOf(image_path_inner + "/" + image_file.name, function (err, dimensions) {

                var width_resize = (dimensions.width * 95) / 100, //la nouvelle largeur
                    height_resize = (dimensions.height * 95) / 100; //la nouvelle hauteur

                image_mobile.resize((dimensions.width - width_resize), (dimensions.height - height_resize)) //on redimensionne le fichier
                    .quality(60) //on spécifie la teneur de la nouvelle qualité
                    .write(image_path_outter + "/mobile/" + image_file.name, //finalement on enregistre le nouveau fichié redimensionné pour la version mobile
                        function () {
                            fs.stat(image_path_outter + "/mobile/" + image_file.name, function (errStatMobile, statsMobile) {

                                if (!errStatMobile) {
                                    image_file.size_mobile = statsMobile.size;
                                }

                                //On recommence toute l'opération précedente
                                Jimp.read(image_path_inner + "/" + image_file.name, function (err, image_mobile) {
                                    if (err) {
                                        console.log(err);
                                        callback(false, "Une erreur est survenue lors de la suppression du fichier :" + err)
                                    } else {

                                        var sizeOf = require("image-size");

                                        sizeOf(image_path_inner + "/" + image_file.name, function (err, dimensions_large) {

                                            var width_resize = (dimensions_large.width * 75) / 100,
                                                height_resize = (dimensions_large.height * 75) / 100;

                                            image_mobile.resize((dimensions_large.width - width_resize), (dimensions_large.height - height_resize))
                                                .quality(60)
                                                .write(image_path_outter + "/" + image_file.name, function () { //Jusqu'à enregistrer la version web du fichier, puis gérer la fin des opérations en callback

                                                    //On procède à la recupérations des nouvelles valeurs du fichier
                                                    fs.stat(image_path_outter + "/" + image_file.name, function (errStat, stats) {

                                                        image_file.size = stats.size;
                                                        image_file.path = image_path_outter;
                                                        image_file.type = type_media;

                                                        fs.unlink(image_path_inner + "/" + image_file.name, function (err) {
                                                            if (err) {
                                                                callback(false, "Une erreur est survenue lors de la suppression du fichier :" + err)
                                                            } else {
                                                                
                                                                callback(true, image_file)
                                                            }
                                                        })

                                                    })

                                                });
                                        })
                                    }

                                });
                            })
                        });
            })
        }

    });
}

/**
 * La fonction permettant de compresser une image
 * @param {*} image_path_inner 
 * @param {*} image_path_outter 
 * @param {*} image_file 
 * @param {*} callback 
 */
function compressImage(image_path_inner, image_path_outter, image_file, type_media, callback) {

    //On test la taille du fichier afin de savoir s'il faut compresser ou pas

    if (image_file.size > 51200) { //Si la taille est supérieure à 50 Ko

        resizeImage(image_path_inner, image_path_outter, image_file, type_media, function (isResized, resultResizing) {

            if (isResized) {
                callback(true, resultResizing)
            } else {
                callback(false, resultResizing)
            }
        });

    } else {//Sinon la taille du fichier est inférieure à 50 ko

        Jimp.read(image_path_inner + "/" + image_file.name, function (err, image) {

            //On se content de juste placer le fichier dans le dossier mobile
            image.write(image_path_outter + "/mobile/" + image_file.name, function () {

                image.write(image_path_outter + "/" + image_file.name, function () {

                    fs.stat(image_path_outter + "/" + image_file.name, function (errStat, stats) {
                        image_file.size_mobile = stats.size;
                        image_file.size = stats.size;

                        //On supprimer la copie du fichier restée dans le dossier temporaire
                        fs.unlink(image_path_inner + "/" + image_file.name, function (err) {
                            if (err) {

                                callback(false, "Une erreur est survenue lors de la suppression du fichier :" + err)

                            } else {

                                //On recupère le bon emplacement du fichier
                                image_file.path = image_path_outter;

                                //et le type du média
                                image_file.type = type_media;

                                callback(true, image_file)
                            }
                        })

                    })

                })

            });
        })
    }
}

//Upload for S3
router.get('/sign-s3', (req, res) => {
    const s3 = new aws.S3();
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
        Bucket: "ndakubizz",
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            console.log(err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://ndakubizz.s3.amazonaws.com/${fileName}`
        };
        res.write(JSON.stringify(returnData));
        res.end();
    });
});

/*----------------------------------------------------------------------------------*/
//KP7ARAN4D3DT2WLYPZPWHG26HOSXLYX7332WLVKF7HML6XB274HUNRV6PXWCQ2OK
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'us-east-2'
});

var s3 = new aws.S3()

var filefilter = (req, file, cb) => {
    if (file.mineType === "image/jpeg" || file.mineType === "image/png") {
        cb(null, true)
    } else {
        cb(new Error("Invalide mine-type"), false)
    }
}

var upload = multer({
    //fileFilter: filefilter,
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: 'Frdrcpeter_metadata' });
        },
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + "_" + file.originalname)
        }
    })
})

const singleUpload = upload.single("image");

//Upload Image
router.post('/image-upload', (req, res) => {
    console.log(process.env.S3_BUCKET+ " " +process.env.AWS_ACCESS_KEY_ID+ ""+ process.env.AWS_SECRET_ACCESS_KEY);
    singleUpload(req, res, (err) => {
        if (!err) {
            return res.json({ flag: true, 'imageUrl': req.file.location, "size": req.file.size, "name": req.body.name})
        } else {
            return res.json({ flag: false, 'imageUrl': null, "size": null, "name": req.body.name })
        }
        
    })
})

module.exports = router;
