import axios from 'axios';

   const instance = axios.create({
     baseURL: 'http://localhost:5000', // URL của backend, thay đổi nếu cần
     timeout: 10000,
   });

   export default instance;