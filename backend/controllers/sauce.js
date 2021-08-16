const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked:[],
    usersDisliked:[],
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

exports.likeSauce = (req, res, next) => {
  const like = req.body.like;
  const userId = req.body.userId;
  const sauceId = req.params.id;
  if(like === -1){
    Sauce.findOneAndUpdate({ _id: sauceId }, { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } })
    .then(sauce => {
      if(sauce.usersLiked.includes(userId)){
      Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $set: { likes: 0 } })
      }
      return res.status(200).json(sauce);
    })
    .catch(error => res.status(404).json({ error }));
  }else if(like === 1){
    Sauce.findOneAndUpdate({ _id: sauceId }, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
    .then(sauce => {
      if(sauce.usersDisliked.includes(userId)){
      Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $set: { dislikes: 0 } })
      }
      return res.status(200).json(sauce);
    })
    .catch(error => res.status(404).json({ error }));
  }else if(like === 0){
    Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId, usersDisliked: userId }, $set: { likes: 0, dislikes: 0 } } )
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
  }
}
