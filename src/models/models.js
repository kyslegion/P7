/* eslint-disable */
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: String,
  grade: Number
});
const bookSchema = new mongoose.Schema({
  title: String,       
  author: String,     
  imageUrl: String,    
  year: Number,        
  genre: String,      
  ratings: [ratingSchema], 
  averageRating: Number
});
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,      // rend le champ email obligatoire
    unique: true,        // s'assure que l'email est unique
    trim: true,          // supprime les espaces avant et après la chaîne
    lowercase: true      // convertit l'email en minuscules
  },
  password: {
    type: String,
    required: true,      // rend le champ mot de passe obligatoire
  },
}, {collection: 'users'});

module.exports = {
  Book: mongoose.model('Book', bookSchema),
  User: mongoose.model('User', userSchema),
};