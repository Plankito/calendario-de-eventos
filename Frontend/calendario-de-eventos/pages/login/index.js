import styled from '@emotion/styled'
import Logon from '../../components/user/Logon'
import Register from '../../components/user/Register'

export default function Login({}){
    return (
        <Container>
            <h1>Faça seu login ou cadastre-se para continuar</h1>
            <div>
                <Register/>
                <Logon/>
            </div>
        </Container>
    )
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: var(--max-width);
    min-height: var(--min-height);
    
`