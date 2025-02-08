export default async function returnUserEvents({token, setFunction, route}){
    const API_URL = process.env['NEXT_PUBLIC_API_URL'];
    const reqOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const url = `${API_URL}/api/${!!route ? route : 'eventos'}`
        const req = await fetch(url, reqOptions);
        
        if (!req.ok) {
            throw new Error('Erro ao buscar dados do eventos');
        }
        const res = await req.json();
        if (setFunction){
            setFunction(res);}
        return res;
    } catch (error) {
        console.log(error.message);
    }
};
