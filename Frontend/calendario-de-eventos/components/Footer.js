import styled from '@emotion/styled'

export default function Footer(){
    return(
        <Container>
            <div className="container-div">
                <p>Todos os direitos reservados © 2025</p>
            </div>
        </Container>
    )
}

const Container = styled.footer`
    background: var(--footer-background);
    color: var(--foreground);
    padding: 16px;

    .container-div{
        margin: 0 auto;
        max-width: var(--max-width);
    }

`