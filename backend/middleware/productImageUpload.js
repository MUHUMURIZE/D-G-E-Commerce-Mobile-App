const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const productsDirectory = path.join(path.dirname(require.resolve('./productImageUpload')), '..', 'uploads', 'products');
const extensionsByMimeType = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      fs.mkdir(productsDirectory, { recursive: true }, (error) => {
        callback(error, productsDirectory);
      });
    },
    filename(req, file, callback) {
      callback(null, `${crypto.randomUUID()}${extensionsByMimeType[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    if (!extensionsByMimeType[file.mimetype]) {
      const error = new Error('Product images must be JPEG, PNG, or WebP.');
      error.statusCode = 400;
      callback(error);
      return;
    }
    callback(null, true);
  },
});

function uploadProductImage(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      return next();
    }
    if (error instanceof multer.MulterError) {
      error.statusCode = 400;
    }
    return next(error);
  });
}

module.exports = { uploadProductImage };
