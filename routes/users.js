var express = require('express');
var router = express.Router();
var passport = require('passport');
/* GET users listing. */
var authenticate = require('../authenticate');
const Users = require('../models/user');
const cors = require('./cors');

const bodyParser = require('body-parser');
var User = require('../models/user');
router.use(bodyParser.json());

router.get('/',cors.corsWithOptions,authenticate.verifyOrdinaryUser,authenticate.verifyAdmin,(req, res, next)=>{
  Users.find({})
    .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
});


router.post('/signup', cors.corsWithOptions,(req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return ;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(
            {success: true,
            status: 'Registration Successful!'
          });
        });
      });
    }
  });
});

router.post('/login',cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', cors.corsWithOptions,(req, res) => {
  req.logout();
  res.redirect('/');
});


module.exports = router;
