import styled from '@emotion/styled'
import {useState, useEffect} from 'react'
import returnUserEvents from './returnUserEvents'

const { AddEvento, EditEvento, formatDate } = require('../eventos/modules');

export default function Eventos({ token, userData }) {
    const [eventos, setEventos] = useState(null);
    const [eventosShares, setEventosShares] = useState(null);
    const [message, setMessage] = useState(null);
    const [editandoEventoId, setEditandoEventoId] = useState(null);
    const [eventoEditado, setEventoEditado] = useState({});

    useEffect(() => {
        if (token && userData?.id) {
            returnUserEvents({ token, setFunction: setEventos, route: `eventos/?filters[user_id][$eq]=${userData.id}` });
            returnUserEvents({ token, setFunction: setEventosShares, route: `eventos-shares/?filters[users_id][$eq]=${userData.id}&populate=*` });
        }
    }, [token, userData]);

    const handleEditClick = (evento) => {
        setEditandoEventoId(evento.id);
        setEventoEditado({
            descricao: evento.descricao,
            inicio: evento.inicio,
            termino: evento.termino,
        });
    };

    const handleSaveEdit = async (id) => {
        await EditEvento(id, eventoEditado, token, setMessage, setEventos);
        setEditandoEventoId(null);
    };

    return (
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
                        <div key={e.id}>
                            {editandoEventoId === e.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={eventoEditado.descricao}
                                        onChange={(ev) => setEventoEditado({ ...eventoEditado, descricao: ev.target.value })}
                                    />
                                    <input
                                        type="datetime-local"
                                        value={eventoEditado.inicio.substring(0, 16)}
                                        onChange={(ev) => setEventoEditado({ ...eventoEditado, inicio: ev.target.value })}
                                    />
                                    <input
                                        type="datetime-local"
                                        value={eventoEditado.termino.substring(0, 16)}
                                        onChange={(ev) => setEventoEditado({ ...eventoEditado, termino: ev.target.value })}
                                    />
                                    <button onClick={() => handleSaveEdit(e.documentId)}>Salvar</button>
                                    <button onClick={() => setEditandoEventoId(null)}>Cancelar</button>
                                </>
                            ) : (
                                <>
                                    <p>
                                        {index + 1} - {e.descricao} - {formatDate(e.inicio)} até {formatDate(e.termino)}
                                    </p>
                                    <button onClick={() => handleEditClick(e)}>Editar</button>
                                </>
                            )}
                        </div>
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
    );
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