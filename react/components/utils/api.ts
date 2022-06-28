import axios from 'axios';

const api = axios.create({
    baseURL: `https://apiv2.motorfiscal.com.br/`
});
api.defaults.headers.common['Authorization'] = '0KwgmGRYjSxW6CHIv8CJeooWerGkxBaSdhi4zs92NpVJV8mhWd6sYlTwgj8F'
api.defaults.headers.common['Content-Type'] = 'application/json'

export default api