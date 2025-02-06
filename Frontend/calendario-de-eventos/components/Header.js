import styled from '@emotion/styled'
import { useRouter } from 'next/router';
import Link from 'next/link'

export default function Header(){
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/login');
    };
    return(
        <Container>
            <div className="container-div">
                <a target="_blank" href='https://www.tokenlab.com.br/pt/home'>
                    <img src="https://www.tokenlab.com.br/assets/icons/common/token-logo-dark.svg" alt="Tokenlab Logo" />
                    <h3>Events</h3>
                </a>
                <nav>
                    <ul>
                        <li><Link href="#" onClick={handleLogout}><i className="fa fa-sign-out" aria-hidden="true"></i></Link></li>
                    </ul>
                </nav>
                {/* <p>Projeto TokenLab</p> */}
            </div>
        </Container>
    )
}

const Container = styled.header`
    background: var(--header-background);
    color: var(--foreground);
    padding: 16px;
    a {
        color: var(--foreground);
        text-decoration: none;
        display: flex;
    }

    nav{
        //margin-left: 100px;
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