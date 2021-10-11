const Sauce = require('../models/sauce');
const fs = require('fs');
const sauce = require('../models/sauce');

// route to create a sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  // sauce schema + the like/dislike function and the image
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  // create sauce
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch(error => res.status(400).json({ error }));
}

// route to modify sauce by getting the sauce you want to modify and then modifying it
exports.modifySauce = (req, res, next) => {
  // modify imageUrl if the image is changed
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  // get user id of the user who added the sauce
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const userId = sauce.userId
  // only allow correct user to update the sauce
    if(userId === req.userId){
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => { res.status(201).json({ message: 'Sauce modifiée !' }) })
      .catch(error => res.status(400).json({ error }));
    } else {
      res.status(403).json({error: error | "Unauthorised request"});
    }
  })
  // update sauce
  
};

// route to delete sauce by getting the sauce you want to delete and then deleting it and its image
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      // find user id
      const userId = sauce.userId;
      // delete image
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        // delete sauce only if user is the one who added the sauce
        if(userId === req.userId){
          Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
          .catch(error => res.status(400).json({ error }));
        } else {
          res.status(403).json({error: error | "Unauthorised request"});
        }
      });
    })
    .catch(error => res.status(500).json({ error }));
};

// route to display one sauce
exports.getOneSauce = (req, res, next) => {
  // display sauce
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
}

// route to display all the sauces added to the app
exports.getAllSauces = (req, res, next) => {
  // display all sauces
  Sauce.find()
    .then((sauces => res.status(200).json(sauces)))
    .catch(error => res.status(400).json({ error }));
}

// function for the like/dislike function
async function removeLikeOrDislike(userId, sauceId){
  try {
    const sauce = await Sauce.findOne({ _id: sauceId })
    const hasLiked = sauce.usersLiked.includes(userId);
    const hasDisliked = sauce.usersDisliked.includes(userId);
    // when user removes his dislike, then userId is removed from the array and like removes its count
    if (hasDisliked) {
      await Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } })
    }
    // when user removes his like, then userId is removed from the array and like removes its count
    if (hasLiked) {
      await Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 } })
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
}

// route to like or dislike the sauce
exports.likeSauce = async (req, res, next) => {
  const like = req.body.like;
  const userId = req.body.userId;
  const sauceId = req.params.id;
  // remove like or dislike
  await removeLikeOrDislike(userId, sauceId);
  // if the user has liked the sauce, then the sauce has been liked and the user cannot dislike it
  if (like === 1) {
    try {
      await Sauce.updateOne({ _id: sauceId }, { $push: { usersLiked: userId }, $inc: { likes: 1 } })
    } catch (error) {
      return res.status(400).json({ error });
    }
    // if the user has disliked the sauce, then the sauce has been disliked and the user cannot like it
  } else if (like === -1) {
    try {
      await Sauce.updateOne({ _id: sauceId }, { $push: { usersDisliked: userId }, $inc: { dislikes: 1 } })
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
  return res.status(200).json({message: "L'utilisateur a aimé ou disliké une sauce"});
}
