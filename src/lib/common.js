/* eslint-disable */
import axios from 'axios';
import { API_ROUTES } from '../utils/constants';

function formatBooks(bookArray) {
  return bookArray.map((book) => {
    const newBook = { ...book };
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
    book.id = book._id;
    return book;
  } catch (e) {
    console.error(e);
    return e.message;
  }
}
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

  console.time("axios call duration"); 
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
    console.timeEnd("axios call duration"); 
    console.log(response, "res");
    console.timeEnd("Total addBook Function Duration");
    return response.data;
  })
  .catch(err => {
    console.timeEnd("axios call duration"); 
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
export async function updateBook(data, id) {
  if (!data || !id) {
    return { error: true, message: 'Invalid data or id' };
  }

  let newData;
  const book = {
    id: data.id,
    title: data.title,
    author: data.author,
    year: data.year,
    genre: data.genre,
  };

  if (data.file && data.file[0]) {
    newData = new FormData();
    newData.append('book', JSON.stringify(book));
    newData.append('image', data.file[0]);
  } else {
    newData = new FormData();
    newData.append('book', JSON.stringify(book));
  }

  try {
    const newBook = await axios({
      method: 'put',
      url: `${API_ROUTES.BOOKS}/${id}`,
      data: newData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': data.file && data.file[0] ? undefined : 'application/json'
      },
    });
    return newBook;
  } catch (err) {
    if (err.response && err.response.data) {
        console.error('Server Response:', err.response.data);
    } else {
        console.error('Error:', err);
    }
    return { error: true, message: err.message };
}
}
