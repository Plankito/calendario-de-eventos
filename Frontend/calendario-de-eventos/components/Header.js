import { useEffect, useState } from "react";
import styled from '@emotion/styled'
import Link from 'next/link'
import returnUserJwt from './user/returnUserJwt';

export default function Header(){
    const [userJwt, setUserJwt] = useState(null);

    useEffect(() => {
        const token = returnUserJwt();
        if (token !== " "){
            setUserJwt(token);
        }
    }, []);

    const handleLogout = () => {
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUserJwt(null);
    };
    return(
        <Container>
            <div className="container-div">
                <a target="_blank" href='https://www.tokenlab.com.br/pt/home'>
                    <img src="https://www.tokenlab.com.br/assets/icons/common/token-logo-dark.svg" alt="Tokenlab Logo" />
                    <h3>Events</h3>
                </a>
                {userJwt && (
                    <nav>
                        <ul>
                            <li>
                                <Link href="/login" onClick={handleLogout} aria-label="Sair">
                                    <i className="fa fa-sign-out" aria-hidden="true"></i>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                )}
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