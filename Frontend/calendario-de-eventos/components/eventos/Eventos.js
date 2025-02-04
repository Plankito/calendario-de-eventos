import styled from '@emotion/styled'
import {useState, useEffect} from 'react'
import returnUserEvents from './returnUserEvents'

export default function Eventos({token, userData}){
    const [eventos, setEventos] = useState(null)
    const [eventosShares, setEventosShares] = useState(null)
    const [message, setMessage] = useState(null);
    const {AddEvento, formatDate} = require('../eventos/modules')
    
    useEffect(() => {
        if (token && userData?.id) {
            returnUserEvents({ token, setFunction: setEventos, route: `eventos/?filters[user_id][$eq]=${userData.id}` })
            returnUserEvents({ token, setFunction: setEventosShares, route: `eventos-shares/?filters[users_id][$eq]=${userData.id}&populate=*` })
        }
    }, [token, userData])

    return(
        <Container>
            <div className='eventos'>
                <div>
                <form onSubmit={(e) => AddEvento(e, token, userData, setMessage, setEventos)}>
                        <input type="text" name="descricao" placeholder="Descrição do evento" required />
                        <input type="datetime-local" name="inicio" required />
                        <input type="datetime-local" name="termino" required />
                        <button type="submit">Criar Evento</button>
                    </form>
                {message && <p id="message">{message}</p>}
                </div>
                <div>
                    <h2>Meus Eventos</h2>
                    {eventos && eventos.data.map((e, index) => (
                        <p key={e.id}>{index + 1} - {e.descricao} - {formatDate(e.inicio)} até {formatDate(e.termino)}</p>
                    ))}
                </div>
            </div>
            <div className='eventos compartilhados'>
                <div>
                    <h2>Eventos Compartilhados Comigo</h2>
                    {eventosShares && eventosShares.data.map((e, index) => (
                        <p key={e.evento.id}>{index + 1} - {e.evento.descricao}</p>
                    ))}
                </div>
            </div>
            
                        
        </Container>
    )
}

const Container = styled.div`
    background: var(--background);
    color: var(--foreground);
    padding: 16px;

    .eventos{
        border-width: 1px;
        border-color: black;
        border-style: solid;
        margin: 20px 0;
        padding: 20px;
    }
`