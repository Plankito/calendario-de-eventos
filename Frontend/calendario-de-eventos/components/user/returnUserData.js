export default async function fetchUserData(token,setFunction, setLoading, route){
    const API_URL = process.env['NEXT_PUBLIC_API_URL'];
    const reqOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    try {
        const url = `${API_URL}/api/users${!!route ? route : '/'}`
        const req = await fetch(url, reqOptions);
        
        if (!req.ok) {
            throw new Error('Erro ao buscar dados do usuário');
        }
        const res = await req.json();
        if (setFunction){
            setFunction(res);}
    } catch (error) {
        console.log(error.message);
    } finally {
        if(setLoading) {
        setLoading(false);
        }
    }
};
