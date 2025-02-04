'use client';
import { useState } from 'react';
import styled from '@emotion/styled';
import Cookies from 'js-cookie';

export default function Register({ route }) {
  const [message, setMessage] = useState(null);
  const API_URL = process.env['NEXT_PUBLIC_API_URL'];

  const register = async (event) => {
    event.preventDefault();
    setMessage(null);
    
    const formData = new FormData(event.target);
    const jsonData = Object.fromEntries(formData);

    if (!jsonData.username || !jsonData.email || !jsonData.password) {
      setMessage({ message: 'Todos os campos são obrigatórios' });
      return;
    }

    try {
      const req = await fetch(`${API_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      });

      const res = await req.json();

      if (res.error) {
        setMessage(res.error.details?.errors ? res.error : { message: res.error.message });
        return;
      }

      if (res.jwt && res.user) {
        Cookies.set('jwt', res.jwt, {
          secure: process.env.NODE_ENV !== 'development',
          sameSite: 'strict',
          expires: 30
        });

        setMessage({ message: 'Registro bem-sucedido!' });

        if (res.user) {
          window.location.href = route ? route : '/';
        } else {
          setMessage({ message: 'Falha ao criar usuário' });
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessage({ message: 'Ocorreu um erro ao processar sua solicitação' });
    }
  };

  return (
    <RegisterStyled>
      <form onSubmit={register}>
        <h2>Cadastro</h2>

        <label htmlFor="username">Usuário</label>
        <input type="text" id="username" name="username" required />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Senha</label>
        <input type="password" id="password" name="password" required />

        <button type="submit">Registrar</button>

        {message?.details?.errors?.map(error => <div key={error.message}>{error.message}</div>)}
        {message?.message && <div>{message.message}</div>}
      </form>
    </RegisterStyled>
  );
}

const RegisterStyled = styled.div`
  background-color: #efefef;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.60);
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
