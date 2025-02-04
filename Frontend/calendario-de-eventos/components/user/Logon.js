'use client';
import { useState } from 'react';
import styled from '@emotion/styled';
import Cookies from 'js-cookie';

export default function Logon({ route }) {
    const [message, setMessage] = useState(null);
    
    const errorsMessage = message?.details?.errors ? message.details.errors.map(error => error.message) : [];

    const login = async (event) => {
        event.preventDefault();
        setMessage(null);

        const formData = new FormData(event.target);
        const jsonData = Object.fromEntries(formData);

        const API_URL = process.env['NEXT_PUBLIC_API_URL'];

        const reqOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        };

        try {
            const req = await fetch(`${API_URL}/api/auth/local`, reqOptions);
            const res = await req.json();

            if (res.error) {
                setMessage(res.error.details?.errors ? res.error : res.error.message);
                return;
            }

            if (res.jwt && res.user) {
                Cookies.set('jwt', res.jwt, {
                    secure: process.env.NODE_ENV !== 'development',
                    sameSite: 'strict',
                    expires: 30
                });

                setMessage('Login realizado com sucesso.');
                window.location.href = route ? route : '/';
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            setMessage("Ocorreu um erro inesperado. Tente novamente.");
        }
    };

    return (
        <Container>
            <form onSubmit={login}>
                <title>Login</title>
                <h2>Login</h2>

                <label htmlFor="identifier" className="block">Username/Email</label>
                <input type="text" id="identifier" name="identifier" className="block" autoComplete="username" />

                <label htmlFor="password" className="block">Password</label>
                <input type="password" id="login-password" name="password" className="block" autoComplete="current-password" />

                <button type="submit">Entrar</button>

                {errorsMessage.map(error => <div key={error}>{error}</div>)}
                {typeof message === 'string' && <div>{message}</div>}
            </form>
        </Container>
    );
}

const Container = styled.div`
  background-color: #efefef;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.40);
  margin: 20px;

  form {
    display: flex;
    flex-direction: column;
    text-align: left;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.10);

    input {
      margin-bottom: 10px;
    }

    button {
      margin-top: 10px;
      padding: 10px 20px;
      background-color: #444;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #222;
      }
    }

    h2 {
      text-align: center;
      margin-bottom: 20px;
    }

    div {
      text-transform: capitalize;
      color: red;
      margin-top: 10px;
      font-size: 14px;
      text-align: center;
    }
  }
`;
