/* eslint-disable */
import axios from 'axios';
import { API_ROUTES } from '../utils/constants';

function formatBooks(bookArray) {
  return bookArray.map((book) => {
    const newBook = { ...book };
    // eslint-disable-next-line no-underscore-dangle
    newBook.id = newBook._id;
    return newBook;
  });
}

export function storeInLocalStorage(token, userId) {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
}

export function getFromLocalStorage(item) {
  return localStorage.getItem(item);
}

export async function getAuthenticatedUser() {
  const defaultReturnObject = { authenticated: false, user: null };
  try {
    const token = getFromLocalStorage('token');
    const userId = getFromLocalStorage('userId');
    if (!token) {
      return defaultReturnObject;
    }
    return { authenticated: true, user: { userId, token } };
  } catch (err) {
    console.error('getAuthenticatedUser, Something Went Wrong', err);
    return defaultReturnObject;
  }
}

export async function getBooks() {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_ROUTES.BOOKS}`,
    });
    // eslint-disable-next-line array-callback-return
    const books = formatBooks(response.data);
    return books;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getBook(id) {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_ROUTES.BOOKS}/${id}`,
    });
    const book = response.data;
    // eslint-disable-next-line no-underscore-dangle
    book.id = book._id;
    return book;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getBestRatedBooks() {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_ROUTES.BEST_RATED}`,
    });
    return formatBooks(response.data);
  } catch (e) {
    console.error(e);
    return [];
  }
}
export async function deleteBook(id) {
  try {
    await axios.delete(`${API_ROUTES.BOOKS}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function rateBook(id, userId, rating) {
  const data = {
    userId,
    rating: parseInt(rating, 10),
  };

  try {
    const response = await axios.post(`${API_ROUTES.BOOKS}/${id}/rating`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const book = response.data;
    // eslint-disable-next-line no-underscore-dangle
    book.id = book._id;
    return book;
  } catch (e) {
    console.error(e);
    return e.message;
  }
}
// Addbook sans modification côté front
export function addBook(data) {
  console.time("Total addBook Function Duration");

  console.time("LocalStorage & Data Preparation");
  const userId = localStorage.getItem('userId');
  const book = {
    userId,
    title: data.title,
    author: data.author,
    year: data.year,
    genre: data.genre,
    ratings: [{
      userId,
      grade: data.rating ? parseInt(data.rating, 10) : 0,
    }],
    averageRating: parseInt(data.rating, 10),
  };
  console.log(JSON.stringify(book));
  const bodyFormData = new FormData();
  
  bodyFormData.append('book', JSON.stringify(book));
  bodyFormData.append('image', data.file[0]);
  console.timeEnd("LocalStorage & Data Preparation");

  console.time("axios call duration"); // Démarrer le chronomètre

  return axios({
    method: 'post',
    url: `${API_ROUTES.BOOKS}`,
    data: bodyFormData,
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
  .then(response => {
    console.timeEnd("axios call duration"); // Arrêter le chronomètre et afficher la durée
    console.log(response, "res");
    console.timeEnd("Total addBook Function Duration");
    return response.data;
  })
  .catch(err => {
    console.timeEnd("axios call duration"); // Arrêter le chronomètre et afficher la durée en cas d'erreur
    console.error(err, "err");

    if (err.code === 'ECONNABORTED') {
      console.timeEnd("Total addBook Function Duration");
      return { error: true, message: 'timeout' };
    }

    if (err.response) {
      console.log(err.response.data);
      console.log(err.response.status);
      console.log(err.response.headers);
      console.timeEnd("Total addBook Function Duration");
      return { error: true, message: err.response.data.message || `Request failed with status code ${err.response.status}` };
    } else if (err.request) {
      console.log(err.request);
      console.timeEnd("Total addBook Function Duration");
      return { error: true, message: "No response received from server." };
    } else {
      console.log('Error', err.message);
      console.timeEnd("Total addBook Function Duration");
      return { error: true, message: err.message };
    }
  });
}




// Modifiecation image par le front
// export async function addBook(data) {
//   console.time("Total addBook Function Duration");

//   console.time("LocalStorage & Data Preparation");
//   const userId = localStorage.getItem('userId');
//   const book = {
//     userId,
//     title: data.title,
//     author: data.author,
//     year: data.year,
//     genre: data.genre,
//     ratings: [{
//       userId,
//       grade: data.rating ? parseInt(data.rating, 10) : 0,
//     }],
//     averageRating: parseInt(data.rating, 10),
//   };
//   console.log(JSON.stringify(book));
//   const bodyFormData = new FormData();
//   bodyFormData.append('book', JSON.stringify(book));

//   // Redimensionnez l'image avant de l'envoyer
//   const resizedImage = await resizeImage(data.file[0]);
//   bodyFormData.append('image', resizedImage);

//   console.timeEnd("LocalStorage & Data Preparation");

//   console.time("axios call duration"); 

//   return axios({
//     method: 'post',
//     url: `${API_ROUTES.BOOKS}`,
//     data: bodyFormData,
//     timeout: 5000,
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//     },
//   })
//   .then(response => {
//     console.timeEnd("axios call duration"); 
//     console.log(response, "res");
//     console.timeEnd("Total addBook Function Duration");
//     return response.data;
//   })
//   .catch(err => {
//     console.timeEnd("axios call duration"); 
//     console.error(err, "err");

//     if (err.code === 'ECONNABORTED') {
//       console.timeEnd("Total addBook Function Duration");
//       return { error: true, message: 'timeout' };
//     }

//     if (err.response) {
//       console.log(err.response.data);
//       console.log(err.response.status);
//       console.log(err.response.headers);
//       console.timeEnd("Total addBook Function Duration");
//       return { error: true, message: err.response.data.message || `Request failed with status code ${err.response.status}` };
//     } else if (err.request) {
//       console.log(err.request);
//       console.timeEnd("Total addBook Function Duration");
//       return { error: true, message: "No response received from server." };
//     } else {
//       console.log('Error', err.message);
//       console.timeEnd("Total addBook Function Duration");
//       return { error: true, message: err.message };
//     }
//   });
// }

// function resizeImage(file) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = function() {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
      
//       // Définir la largeur et la hauteur souhaitées
//       canvas.width = 463;
//       canvas.height = 595;

//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//       canvas.toBlob((blob) => {
//         resolve(blob);
//       }, file.type);
//     };
//     img.onerror = function(err) {
//       reject(err);
//     };
//     img.src = URL.createObjectURL(file);
//   });
// }






export async function updateBook(data, id) {
  // const userId = localStorage.getItem('userId');

  let newData;
  const book = {
    id: data.id,
    title: data.title,
    author: data.author,
    year: data.year,
    genre: data.genre,
  };
  if (data.file[0]) {
    newData = new FormData();
    newData.append('book', JSON.stringify(book));
    newData.append('image', data.file[0]);
  } else {
    newData = { ...book };
  }

  try {
    const newBook = await axios({
      method: 'put',
      url: `${API_ROUTES.BOOKS}/${id}`,
      data: newData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return newBook;
  } catch (err) {
    console.error(err);
    return { error: true, message: err.message };
  }
}
