class simfetch{

    constructor(options){
        this.baseurl = options?.baseurl;
        this.headers = options?.headers || {};
        
    }
    async fetch(path, options = {}){
        const url = `${this.baseurl}${path}`;
        const response = await fetch(url, {
        ...options,
            headers:{
                ...this.headers,
                ...options.headers
            },
        });
        if(!response.ok){
            throw new Error(`simfetch error: ${response.status} - ${response.statusText}`);
        }
    const  ContentType = response.headers.get('Content-Type');

            if(response.type === JSON){
                return await response.json();
            }
            else{
                return await response.text();
            }
    }
    get(path, options = {}){
        return this.fetch(path, {
            method: 'GET',
            ...options
        });
    }
    post(path, data, options = {}){
        return this.fetch(path, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        })
    }
    put(path, data, options = {}){
        return this.fetch(path, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        })
    }
    delete(path, options = {}){
        return this.fetch(path, {
            method: 'DELETE',
            ...opions
        })
    }
}
 module.exports={simfetch}