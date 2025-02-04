import Cookies from 'js-cookie'

export default function returnUserJwt(){
        const token = Cookies.get('jwt');
        //const MINIMAL_TOKEN = process.env['MINIMAL_TOKEN'];
        if(token){
                return token;
        }
        //console.log(MINIMAL_TOKEN)
        return " ";
}