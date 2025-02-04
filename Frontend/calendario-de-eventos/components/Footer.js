import styled from '@emotion/styled'

export default function Footer(){
    return(
        <Container>
            <div className="container-footer">
                <div className='row'>
                    <div className='footer-col'>
                        <h4>Tokenlab</h4>
                        <nav>
                            <ul>
                                <li><a href="https://www.tokenlab.com.br/#what-we-do">O que fazemos</a></li>
                                <li><a href="https://www.tokenlab.com.br/pt/about-us">A Tokenlab</a></li>
                                <li><a href="https://www.tokenlab.com.br/pt/cases">Cases</a></li>
                                <li><a href="https://www.tokenlab.com.br/#costumers">Clientes</a></li>
                            </ul>
                        </nav>
                    </div>
                    <div className='footer-col'>
                        <h4>Contato</h4>
                        <nav>
                            <ul>
                                <li><a href="https://www.tokenlab.com.br/pt/contact-us">Contato</a></li>
                                <li><a href="https://blog.tokenlab.com.br/">Blog</a></li>
                            </ul>
                        </nav>
                    </div>
                    <div className='footer-col'>
                        <h4>Links Úteis</h4>
                        <nav>
                            <ul>
                                <li><a href="https://www.tokenlab.com.br/pt/links">Nossos links</a></li>
                                <li><a href="https://www.tokenlab.com.br/pt/privacy-policy">Politica de Privacidade</a></li>
                            </ul>
                        </nav>
                    </div>
                    <div className='footer-col'>
                        <h4>Redes Sociais</h4>
                        <nav>
                            <div className='social-links'>
                                <a href='https://www.facebook.com/' target="_blank"><i className='fab fa-facebook-f'></i></a>
                                <a href='https://x.com/' target="_blank"><i className='fab fa-twitter'></i></a>
                                <a href='https://www.instagram.com/' target="_blank"><i className='fab fa-instagram'></i></a>
                                <a href='https://www.linkedin.com/' target="_blank"><i className='fab fa-linkedin-in'></i></a>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </Container>
    )
}

const Container = styled.footer`
    background: var(--footer-background);
    color: var(--foreground);
    padding: 30px 16px;

    .container-footer{
        margin: 0 auto;
        max-width: var(--max-width);
    }
    
    *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    .container-footer {
        max-width: 1600px;
        margin: auto;
    }
    .row{
        display: flex;
        width: 100%;
        flex-wrap: wrap;
    }
    
    .footer-col {
        width: 25%;
        padding: 0 15px;

        h4{
            font-size: 1.20rem;
            text-align: left;
            text-transform: capitalize;
            margin-bottom: 30px;
            position: relative; 
            font-weight: 500;
        }
        h4::before {
            content: "";
            position: absolute;
            bottom: -10px;
            left: 0;
            height: 2px;
            background-color:rgb(14, 116, 102);
            box-sizing: border-box;
            width: 100px;
        }
        ul{
            text-align: left;
            list-style: none;
        }
        ul li:not(:last-child){
            margin-bottom: 10px;
        }
        ul li a{
            font-size: 1rem;
            text-transform: capitalize;
            text-decoration: none;
            color:rgb(80, 80, 80);
            display: block;
            transition: all 0.3s ease;
        }
        ul li a:hover{
            color: #ffffff;
            padding-left: 8px;
        }
        .social-links{
            text-align: left;
        }
        .social-links a{
            display: inline-block;
            height: 40px;
            width: 40px;
            background-color: rgba(255, 255, 255, 0.2);
            margin: 0 10px 10px 0;
            text-align: center;
            line-height: 40px;
            border-radius: 50%;
            color:rgb(0, 0, 0);
            transition: all 0.5s ease;
        }
        .social-links a:hover{
            
            color:rgb(30, 226, 233);
            background-color: rgba(255, 255, 255, 0.5);
            transform: scale(1.2);

        }
    }
    @media screen and (max-width: 992px){
        .footer-col{
            width: 50%;
            margin-bottom: 30px;
        }
    }
    @media screen and (max-width: 350px){
        padding: 30px 0;

    }

    
`