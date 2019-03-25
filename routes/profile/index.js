const express = require('express');
const bcrypt = require('bcrypt'); // eslint-disable-line
const Profile = require('../../models/profile');
const jwtAuth = require('../../lib');
const config = require('../../config');
const enforceContentType = require('enforce-content-type');
const fs = require('fs');

const router = new express.Router();
const publicKey = fs.readFileSync('config/jwtRS256.key.pub');

router.use(enforceContentType({
  type: 'application/json',
  force: true,
}));

router.post('/create', (req, res) => {
  const body = req.body;
  const profile = new Profile(body);
  profile.save((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ success: true });
      }
    });
});

router.patch('/update', (req, res) => {
  const pan = req.body.pan;
  if (pan) {
    Profile.findOneAndUpdate({pan}, {$set: req.body}, (err, doc) => {
      if (err) {
        res.status(500).json(err);
      } else {
        if (doc) {
          res.json({
            success: true,
            updated: doc,
          });
        } else {
          res.status(400).json({
            success: false,
            error: "Pan not found",
          });
        }
      }
    });
  } else {
    res.status(400).json({success: false,
    error: 'No pan details in request'});
  }
  
});

router.post('/get', (req, res) => {
  const pan = req.body.pan;
  console.log('')
  if (pan) {
    Profile.findOne({pan}, (err, doc) => {
      if (err) {
        res.status(500).json(err);
      } else {
        console.log("inside,", doc)
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
