const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt'); // eslint-disable-line
const Profile = require('../../models/profile');
const jwtAuth = require('../../lib');
const config = require('../../config');
const enforceContentType = require('enforce-content-type');
const fs = require('fs');
const multer = require('multer');
const router = new express.Router();
const {Storage} = require('@google-cloud/storage');
const publicKey = fs.readFileSync('config/jwtRS256.key.pub');

// router.use(enforceContentType({
//   type: 'application/json',
//   force: true,
// }));


const projectId = 'ultra-physics-235414';

// Creates a client
const gsStorage = new Storage({
    projectId: projectId,
    // keyFile: './keyFile.json',
    keyFilename: './config/keyFile.json',
});
 
// The name for the new bucket
const bucketName = 'filewan-docs';
    // Creates a client
    // const storage = new Storage();
let name = '';
const DIR = './uploads';
 
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
      name = file.originalname.split('.')[0] + '-' + Date.now() + path.extname(file.originalname)
      cb(null, name);
    }
});
let upload = multer({storage: storage});

// router.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
//     res.setHeader('Access-Control-Allow-Methods', 'POST');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
//   });
// router.post('/create', (req, res) => {
//   const body = req.body;
//   const profile = new Profile(body);
//   profile.save((err) => {
//       if (err) {
//         res.status(500).send(err);
//       } else {
//         res.json({ success: true });
//       }
//     });
// });

router.post('/upload', upload.single('photo'), async(req, res) => {
    if (!req.file) {
        console.log("No file received");
        
        return res.send({
          success: false
        });
    
      } else {
        console.log('file received');
        try {
            await gsStorage.bucket(bucketName).upload(`./uploads/${name}`, {
                // Support for HTTP requests made with `Accept-Encoding: gzip`
                gzip: true,
                metadata: {
                  // Enable long-lived HTTP caching headers
                  // Use only if the contents of the file will never change
                  // (If the contents will change, use cacheControl: 'no-cache')
                  cacheControl: 'public, max-age=31536000',
                },
              });
              Profile.findOneAndUpdate({pan: req.body.pan}, {$push: {documents: {type: req.body.filetype, path: name}}}, (err, doc) => {
                if (doc) {
                    res.json({
                        success: false,
                        doc,
                      });
                } else {
                    res.json({
                        success: false,
                        error: 'Error happened during upload'
                      });
                }
              });
              console.log(`${name} uploaded to ${bucketName}.`);
        }
        catch(err) {
            return res.json({
                success: false,
                error: 'Error happened during upload',
                details: err,
              })
        }
      }
    });
    
    router.get('/download', async(req,res) => {
      const srcFilename = req.query.f;
      const options = {
        // The path to which the file should be downloaded, e.g. "./file.txt"
        destination: `./downloads/${srcFilename}`,
      };
      try {
        await gsStorage
        .bucket(bucketName)
        .file(srcFilename)
        .download(options);

        console.log(
        `gs://${bucketName}/${srcFilename} downloaded to ./downloads/${srcFilename}.`
        );
        res.download(path.join(__dirname, `../../downloads/${srcFilename}`));
      }
      catch(err) {
        console.log(err);
        if (err.code == 'CONTENT_DOWNLOAD_MISMATCH') {
          res.download(path.join(__dirname, `../../downloads/${srcFilename}`));
        } else {
          res.status(500).json({
            success:false,
            error: err,
          });
        }
      }
      
    });
//   const pan = req.body.pan;
//   if (pan) {
//     Profile.findOneAndUpdate({pan}, {$set: req.body}, (err, doc) => {
//       if (err) {
//         res.status(500).json(err);
//       } else {
//         if (doc) {
//           res.json({
//             success: true,
//             updated: doc,
//           });
//         } else {
//           res.status(400).json({
//             success: false,
//             error: "Pan not found",
//           });
//         }
//       }
//     });
//   } else {
//     res.status(400).json({success: false,
//     error: 'No pan details in request'});
//   }
  

router.post('/get', (req, res) => {
  const pan = req.body.pan;
  console.log('')
  if (pan) {
    Profile.findOne({pan}, (err, doc) => {
      if (err) {
        res.status(500).json(err);
      } else {
        if (doc) {
          res.json({
            success: true,
            profile: doc,
          });
        } else {
          res.status(400).json({success: false,
            error: 'No pan details in request'});
          }
      }
    });
  } else {
    res.status(400).json({success: false,
    error: 'No pan details in request'});
  }
});

router.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  // console.log(err);
  if (err.name === 'UnauthorizedError') {
    switch (err.code) {
      case 'TokenExpiredError':
        res.status(401).send('Token has expired');
        break;

      case 'JsonWebTokenError':
        res.status(401).send('Invalid Token');
        break;

      case 'BadOptionsError':
        res.status(401).send(err.message);
        break;

      case 'TokenNotSentError':
        res.status(401).send(err.message);
        break;

      default:
        res.status(401).send('Unauthorized Access');
        break;
    }
  }
});

module.exports = router;
