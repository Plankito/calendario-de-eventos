'use client'
import styled from '@emotion/styled'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import returnUserJwt from '../components/user/returnUserJwt'
import Eventos from '../components/eventos/Eventos'

export default function Home({ userJwt, userData, usersData }) {
  const router = useRouter()

  useEffect(() => {
    if (returnUserJwt() === " ") {
      router.push('/login')
    }
  }, [userJwt, router])

  if (!userData) return <Container><p>Loading...</p></Container>
  if (userJwt){
  return (
    <Container>
      <h1>Calendário de Eventos de {userData?.username}</h1>
      <Eventos token={userJwt} userData={userData}/>
    </Container>
  )}
}

const Container = styled.div`
  background: var(--background);
  color: var(--foreground);
  display: flex;
  text-align: left;
  flex-direction: column;
  min-height: var(--min-height);
  max-width: var(--max-width);
  margin: 0 auto 30px;

  h1{
    margin: 20px;
    text-align: center;
  }
  
`
