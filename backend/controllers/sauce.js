const Sauce = require('../models/sauce');
const fs = require('fs');
const sauce = require('../models/sauce');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
    .catch(error => res.status(400).json({ error }));
}

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => { res.status(201).json({ message: 'Sauce modifiée !' }) })
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
}

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces => res.status(200).json(sauces)))
    .catch(error => res.status(400).json({ error }));
}

async function removeLikeOrDislike(userId, sauceId){
  try {
    const sauce = await Sauce.findOne({ _id: sauceId })
    const hasLiked = sauce.usersLiked.includes(userId);
    const hasDisliked = sauce.usersDisliked.includes(userId);
    if (hasDisliked) {
      await Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } })
    }
    if (hasLiked) {
      await Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 } })
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
}

exports.likeSauce = async (req, res, next) => {
  const like = req.body.like;
  const userId = req.body.userId;
  const sauceId = req.params.id;
  await removeLikeOrDislike(userId, sauceId);
  if (like === 1) {
    try {
      await Sauce.updateOne({ _id: sauceId }, { $push: { usersLiked: userId }, $inc: { likes: 1 } })
    } catch (error) {
      return res.status(400).json({ error });
    }
  } else if (like === -1) {
    try {
      await Sauce.updateOne({ _id: sauceId }, { $push: { usersDisliked: userId }, $inc: { dislikes: 1 } })
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
  return res.status(200).json({message: "L'utilisateur a aimé ou disliké une sauce"});
}
