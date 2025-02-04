import styled from '@emotion/styled'
import Logon from '../../components/user/Logon'
import Register from '../../components/user/Register'

export default function Login({}){
    return (
        <Container>
            <h1>Faça seu login ou cadastre-se para continuar</h1>
            <div className='div-principal'>
                <Register/>
                <Logon/>
            </div>
        </Container>
    )
}

const Container = styled.div`
    margin: 0 auto 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    max-width: var(--max-width);
    min-height: var(--min-height);

    h1{
        padding: 0 20px;
    }

    .div-principal{
        display: flex;
        flex-direction: row;
    }

    @media screen and (max-width: 1300px){
       .div-principal{
            flex-direction: column;
        }
    }

    @media screen and (max-width: 768px){
        flex-direction: column;
        h1{
            padding: 20px;
        }
    }
    
`