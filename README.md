# sim-fetch
fetch api simplified for http requests
e.g

//get method
const { simfetch } = require(".");

let sf = new simfetch({
    baseurl:'https://jsonplaceholder.typicode.com',
    headers:{
        'Content-Type':'application/json'
     }
})

sf.get('/users')
 .then((data)=>{
    console.log("users", data)
 })
 .catch((error)=>{
    console.log("error fetching data: ", error);
    
 })

 supports: get(), put(), post(), delete()
it automatically checks if the requested data is text or json format 
i'll make a clear documentation on the next update
 
