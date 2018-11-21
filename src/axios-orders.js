import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://react-burgerbuilder-79d79.firebaseio.com/'
});

export default instance;