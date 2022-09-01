import axios from 'axios';

export const GIT_BASE_URL = process.env.REACT_APP_GIT_BASE_URL;

const GIT_ACCESS_TOKEN = process.env.REACT_APP_GIT_ACCESS_TOKEN;

const apiInst = axios.create({
  baseURL: GIT_BASE_URL,
  timeout: 30000  // 30 seconds
})

apiInst.interceptors.request.use(config => {
  // Set authorization header for all outgoing git api calls
  config.headers['Authorization'] = 'Bearer ' + GIT_ACCESS_TOKEN;
  return config;
})

const GitAPIs = {
  searchUsers: (params) => apiInst.get('/search/users', { params }),  //  For more details - https://docs.github.com/en/rest/search#search-users
  getUserDetails: (userId) => apiInst.get('/users/' + userId)         //  https://docs.github.com/en/rest/users/users#get-a-user
}

export default GitAPIs;