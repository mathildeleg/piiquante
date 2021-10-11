// handle images
const multer = require('multer');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// store images into the directory images
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    // name of the image file with a timestamp and proper image type
    filename: (req, file, callback) => {
        // if image name doesn't have "jpg" ou "png", then add it at the end + the current date
        if (file.originalname !== 'jpg' || file.originalname !== 'png'){
            const name = file.originalname.split(' ').join('_');
            const extension = MIME_TYPES[file.mimetype];
            callback(null, name + Date.now() + '.' + extension);
        }
        // else, only remove the empty spaces but don't add the type
        else {
            const name = file.originalname.split(' ').join('_');
            callback(null, name);
        }
    }
});

module.exports = multer({storage: storage}).single('image');