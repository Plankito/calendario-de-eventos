import styled from '@emotion/styled'
import Link from 'next/link'

export default function Footer(){
    return(
        <Container>
            <div className="container-div">
                <a target="_blank" href='https://www.tokenlab.com.br/pt/home'>
                    <img src="https://www.tokenlab.com.br/assets/icons/common/token-logo-dark.svg" alt="Tokenlab Logo" />
                    <h3>Events</h3>
                </a>
                <nav>
                    <ul>
                        <li><Link href='https://www.tokenlab.com.br/pt/blog'>Blog</Link></li>
                        <li><Link href='https://www.tokenlab.com.br/pt/contact'>Contato</Link></li>
                        <li><Link href='https://www.tokenlab.com.br/pt/terms'>Termos e Condições</Link></li>
                        <li><Link href='https://www.tokenlab.com.br/pt/privacy'>Política de Privacidade</Link></li>
                        <li><Link href='https://www.tokenlab.com.br/pt/about'>Sobre nós</Link></li>
                        <li><Link href='https://www.tokenlab.com.br/pt/careers'>Carreira</Link></li>
                    </ul>
                </nav>Link
                {/* <p>Projeto TokenLab</p> */}
            </div>
        </Container>
    )
}

const Container = styled.footer`
    background: var(--header-background);
    color: var(--foreground);
    padding: 16px;
    a {
        color: var(--foreground);
        text-decoration: none;
        display: flex;
    }

    nav{
        margin-left: 100px;
        display: flex;
        align-items: center;
        ul{
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            list-style: none;
            margin: 0;
            padding: 0;
            li{
                margin-right: 16px;
            }
        }
    }

    .container-div{
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0 auto;
        max-width: var(--max-width);
    }


`