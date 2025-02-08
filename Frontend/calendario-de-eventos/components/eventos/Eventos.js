import styled from '@emotion/styled'
import { useState, useEffect } from 'react'
import returnUserEvents from './returnUserEvents'

const { addEvento, editEvento, deleteEvento, recusarEvento, formatDate, agruparEventosPorMes } = require('../eventos/modules');


export default function Eventos({ token, userData }) {
    const [eventos, setEventos] = useState(null);
    const [eventosShares, setEventosShares] = useState(null);
    const [message, setMessage] = useState(null);
    const [messages, setMessages] = useState({});
    const [editandoEventoId, setEditandoEventoId] = useState(null);
    const [eventoEditado, setEventoEditado] = useState({});

    useEffect(() => {
        if (token && userData?.id) {
            returnUserEvents({ token, setFunction: setEventos, route: `eventos/?filters[user_id][$eq]=${userData.id}` });
            returnUserEvents({ token, setFunction: setEventosShares, route: `eventos-shares/?filters[users_ids][$eq]=${userData.id}&populate=*` });
        }
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [token, userData, message]);

    useEffect(() => {
        // Refresh de "Eventos Compartilhados Comigo"
        if (token && userData?.id) {
            const interval = setInterval(async () => {
                try {
                    const novosEventosShares = await returnUserEvents({
                        token,
                        setFunction: false,
                        route: `eventos-shares/?filters[users_ids][$eq]=${userData.id}&populate=*`
                    });
    
                    if (!novosEventosShares?.data) {
                        return;
                    }
    
                    let eventosAlterados = false;
    
                    novosEventosShares?.data.forEach((e) => {
                        const eventoAnterior = eventosShares?.data.find((evento) => evento.id === e.id);
    
                        if (!eventoAnterior) {
                            console.log(`Evento adicionado: ${e.id}`);
                            eventosAlterados = true;
                        } 
                        else if (eventoAnterior.updatedAt !== e.updatedAt || eventoAnterior.evento !== e.evento) {
                            console.log(`Evento alterado: ${e.id}`);
                            eventosAlterados = true;
                        }
                    });
    
                    eventosShares?.data.forEach((eventoAnterior) => {
                        const eventoAtual = novosEventosShares?.data.find((e) => e.id === eventoAnterior.id);
    
                        if (!eventoAtual) {
                            console.log(`Evento removido: ${eventoAnterior.id}`);
                            eventosAlterados = true;
                        }
                    });
    
                    if (eventosAlterados) {
                        console.log('Eventos alterados (adicionados, removidos ou alterados):', novosEventosShares.data);
                        setEventosShares(novosEventosShares);
                    }
                } catch (error) {
                    console.log('Erro ao buscar eventos:', error.message);
                }
            }, 5000);
    
            return () => clearInterval(interval);
        }
    }, [token, userData, eventosShares]);
    

    const validarDatas = (inicio, termino) => {
        if (new Date(inicio) >= new Date(termino)) {
            return "A data de início deve ser antes da data de término.";
        }
        const agora = new Date().getTime();
        if (new Date(inicio) < agora || new Date(termino) < agora) {
            return "Não é possível adicionar eventos no passado!" ;
        }
        return null;
    };

    const handleEditClick = (evento) => {
        setEditandoEventoId(evento.id);
        setEventoEditado({
            descricao: evento.descricao,
            inicio: evento.inicio,
            termino: evento.termino,
        });
    };

    const handleSaveEdit = async (id) => {
        const erro = validarDatas(eventoEditado.inicio, eventoEditado.termino);
        if (erro) {
            setMessages(prev => ({ ...prev, [id]: erro }));
            return;
        }
        await editEvento(eventos, id, eventoEditado, token, (msg) => {
        }, setEventos);
        setEditandoEventoId(null);
        setMessages({});
    };
    const eventosAgrupados = eventos ? agruparEventosPorMes(eventos.data) : {};

    return (
        <Container>
            <div className="section">
                <h2>Criar Novo Evento</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const inicio = formData.get("inicio");
                    const termino = formData.get("termino");

                    const erro = validarDatas(inicio, termino);
                    if (erro) {
                        setMessage(erro);
                        return;
                    }

                    addEvento(eventos, e, token, userData, setMessage, setEventos, setEventosShares, null);
                }}>
                    <input type="text" name="descricao" placeholder="Descrição do evento" required />
                    <input type="datetime-local" name="inicio" required />
                    <input type="datetime-local" name="termino" required />
                    <input type="text" name="compartilhar" placeholder="(Opcional) Compartilhar com... (Use ' ; ' para adicionar mais de um usuário)"/>
                    <button type="submit">Criar Evento</button>
                </form>
                {message && <p className="message">{message}</p>}
            </div>

            <div className="section">
                <h2>Meus Eventos</h2>
                {Object.keys(eventosAgrupados).map((mes) => (
                    <div key={mes} className="mes-div">
                        <h3>{mes[0].toUpperCase() + mes.slice(1)}</h3>
                        {eventosAgrupados[mes].map((e, index) => (
                            <div className="event-card" key={e.id}>
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
                                        <button className="secondary" onClick={() => setEditandoEventoId(null)}>Cancelar</button>
                                        <button className="danger" onClick={() => deleteEvento(e.documentId, token, setEventos, setMessage, setEditandoEventoId, userData, eventosShares)}>🗑️ Excluir</button>
                                        {messages[e.documentId] && <p className="message">{messages[e.documentId]}</p>}
                                    </>
                                ) : (
                                    <>
                                        <p className="event-text">
                                            {index + 1} - {e.descricao} - {formatDate(e.inicio)} até {formatDate(e.termino)}
                                        </p>
                                        <button onClick={() => handleEditClick(e)}>Editar</button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="section">
                <h2>Eventos Compartilhados Comigo</h2>
                {eventosShares && eventosShares.data.filter(e => e.evento && e.users_ids).sort((a, b) => new Date(a.evento.inicio) - new Date(b.evento.inicio)).map((e, index) => (
                    <div  className="event-card">
                        <p key={e.evento.id}>{index + 1} - {e.evento.descricao} - {formatDate(e.evento.inicio)} até {formatDate(e.evento.termino)}</p>
                        <button onClick={async () => {
                            try {
                                const sucesso = await addEvento(eventos, null, token, userData, setMessages, setEventos, setEventosShares, e.evento);
                            if (sucesso) {
                                await recusarEvento(e.documentId, token, userData, setEventosShares, setMessages, true);
                            }
                            } catch (error) {
                                console.error("Erro ao adicionar evento:", error);
                            }
                        }}>Aceitar</button>

                        <button className="danger" onClick={() => recusarEvento(e.documentId, token, userData, setEventosShares, setMessages)}>🗑️ Recusar</button>
                    </div>
                ))}
            </div>
        </Container>
    );
}

const Container = styled.div`
    background: #f5f5f5;
    color: #333;
    padding: 20px 20px 0;
    font-family: Arial, sans-serif;
    border-radius: 10px;

    .section {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
    }

    .mes-div {
        margin-top: 20px;
    }

    .mes-div h3 {
        margin-bottom: 10px;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    input {
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 16px;

        &:focus {
            border-color: #007bff;
            outline: none;
        }
    }

    button {
        padding: 10px;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
        background: #007bff;
        color: white;
        transition: background 0.2s ease-in-out;

        &:hover {
            background: #0056b3;
        }
    }

    .secondary {
        background: #6c757d;

        &:hover {
            background: #5a6268;
        }
    }

    .danger {
        background: #dc3545;

        &:hover {
            background: #c82333;
        }
    }

    .message {
        color: #dc3545;
        font-weight: bold;
        margin-top: 10px;
    }

    .event-card {
        background: #fff;
        padding: 15px;
        border-radius: 8px;
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        border: 1px solid #ddd;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .event-text {
        font-size: 16px;
        font-weight: bold;
    }
`;


