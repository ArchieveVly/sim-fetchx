const { SimFetchX } = require("../dist/core.js");

const api = new SimFetchX({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  retry: true,
  retryNumber: 3,
});

(async () => {
  try {
    const response = await api.get('/users');
    const users = await response.json();
    console.log(users);
  } catch (error) {
    console.error('Request failed:', error);
  }
})();
