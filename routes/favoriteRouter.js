const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const Favorites = require("../models/favorite")
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route("/")
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyOrdinaryUser, (req, res, next) => {
        Favorites.findOne({"user": req.user._id})
            .populate("user")
            .populate("dishes")
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
        Favorites.findOne({"user": req.user._id})
            .then((favorite) => {
                if(!favorite) {
                    //creates favorite if not existing
                    Favorites.create({"user": req.user._id, "dishes": req.body})
                        .then((favorite) =>{
                            favorite.save()
                                .then((favorite) => {
                                    Favorites.findById(favorite._id)
                                        .populate("user")
                                        .populate("dishes")
                                        .then((favorite) => {
                                            res.statusCode = 200;
                                            res.setHeader("Content-Type", "application/json");
                                            res.json(favorite);
                                        })

                                })
                        })
                        .catch((err) => next(err))
                }
                else {
                    //posts favorites without creating
                    for(let i = 0; i < req.body.length; i++) {
                        if(favorite.dishes.indexOf(req.body[i]._id) < 0 ) {
                            favorite.dishes.push(req.body[i]._id);
                        }
                    }
                    favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate("user")
                                .populate("dishes")
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json(favorite);
                                })
                        })
                        .catch((err) =>  next(err))
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
        Favorites.findOneAndRemove({"user": req.user._id})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err))
    });

favoriteRouter.route("/:dishId")
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorite) => {
                if(!favorite) {
                    Favorites.create({user: req.user._id})
                        .then((favorite) => {
                            favorite.dishes.push({"_id": req.params.dishId})
                            favorite.save()
                                .then((favorite) => {
                                    Favorites.findById(favorite._id)
                                        .populate("user")
                                        .populate("dishes")
                                        .then((favorite) => {
                                            res.statusCode = 200;
                                            res.setHeader("Content-Type", "application/json");
                                            res.json(favorite);
                                        })
                                })
                                .catch((err => next(err)))
                        })
                }
                else {
                    if(favorite.dishes.indexOf(req.params.dishId) < 0) {
                        favorite.dishes.push({"_id": req.params.dishId})
                        favorite.save()
                            .then((favorite) => {
                                Favorites.findById(favorite._id)
                                    .populate("user")
                                    .populate("dishes")
                                    .then((favorite) => {
                                        res.statusCode = 200;
                                        res.setHeader("Content-Type", "application/json");
                                        res.json(favorite);
                                    })
                            })
                            .catch((err) => next(err))
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorite) => {
                    if(favorite.dishes.indexOf(req.params.dishId) >= 0) {
                        favorite.dishes.splice(favorite.dishes.indexOf(req.params.dishId), 1);//removes dish with id
                        favorite.save()
                            .then((favorite) => {
                                Favorites.findById(favorite._id)
                                    .populate("user")
                                    .populate("dishes")
                                    .then((favorite) => {
                                        res.statusCode = 200;
                                        res.setHeader("Content-Type", "application/json");
                                        res.json(favorite);
                                    })
                            })
                            .catch((err) => next(err))
                    }
                    else{
                        res.statusCode = 404;
                        res.setHeader("Content-Type", "application/json");
                        res.end("You don't have favorites");
                    }
            }, (err) => next(err))
            .catch((err) => next(err))
    });

module.exports = favoriteRouter;