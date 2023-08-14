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
  email: String,
  password: String,
}, {collection: 'users'});

module.exports = {
  Book: mongoose.model('Book', bookSchema),
  User: mongoose.model('User', userSchema),
};