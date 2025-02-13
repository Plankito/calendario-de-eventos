import styled from '@emotion/styled'
import { useState, useEffect } from 'react'
import returnUserEvents from './returnUserEvents'

const { addEvento, editEvento, deleteEvento, recusarEvento, formatDate, agruparEventosPorMes, aceitarEvento, converterParaUTC, sairDoEvento } = require('../eventos/modules');


export default function Eventos({ token, userData }) {
    const [eventos, setEventos] = useState(null);
    const [eventosShares, setEventosShares] = useState(null);
    const [message, setMessage] = useState(null);
    const [messages, setMessages] = useState({});
    const [editandoEventoId, setEditandoEventoId] = useState(null);
    const [eventoEditado, setEventoEditado] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (token && userData?.id) {
            returnUserEvents({ token, setFunction: setEventos, route: `eventos/?filters[$or][0][user_id][$eq]=${userData.id}&filters[$or][1][shared_users_id][$in]=${userData.id}&populate=*`});
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

                    const novosEventos = await returnUserEvents({
                        token,
                        setFunction: setEventos,
                        route: `eventos/?filters[$or][0][user_id][$eq]=${userData.id}&filters[$or][1][shared_users_id][$in]=${userData.id}&populate=*`
                    });

                    const novosEventosSharesData = novosEventosShares?.data || [];
                    const novosEventosData = novosEventos?.data || [];

                    const eventosSharesData = eventosShares?.data || [];
                    const eventosData = eventos?.data || [];

                    if (!novosEventosSharesData.length && !novosEventosData.length) {
                        return;
                    }

                    let eventosAlterados = false;

                    novosEventosSharesData.forEach((e) => {
                        const eventoAnterior = eventosSharesData.find((evento) => evento.id === e.id);

                        if (!eventoAnterior) {
                            console.log(`Evento compartilhado adicionado: ${e.id}`);
                            eventosAlterados = true;
                        } else if (eventoAnterior.updatedAt !== e.updatedAt || eventoAnterior.evento !== e.evento) {
                            console.log(`Evento compartilhado alterado: ${e.id}`);
                            eventosAlterados = true;
                        }
                    });

                    eventosSharesData.forEach((eventoAnterior) => {
                        const eventoAtual = novosEventosSharesData.find((e) => e.id === eventoAnterior.id);

                        if (!eventoAtual) {
                            console.log(`Evento compartilhado removido: ${eventoAnterior.id}`);
                            eventosAlterados = true;
                        }
                    });

                    novosEventosData.forEach((e) => {
                        const eventoAnterior = eventosData.find((evento) => evento.id === e.id);

                        if (!eventoAnterior) {
                            console.log(`Evento principal adicionado: ${e.id}`);
                            eventosAlterados = true;
                        } else if (eventoAnterior.updatedAt !== e.updatedAt || eventoAnterior.evento !== e.evento) {
                            console.log(`Evento principal alterado: ${e.id}`);
                            eventosAlterados = true;
                        }
                    });

                    eventosData.forEach((eventoAnterior) => {
                        const eventoAtual = novosEventosData.find((e) => e.id === eventoAnterior.id);

                        if (!eventoAtual) {
                            console.log(`Evento principal removido: ${eventoAnterior.id}`);
                            eventosAlterados = true;
                        }
                    });

                    if (eventosAlterados) {
                        console.log('Eventos alterados (adicionados, removidos ou alterados)');
                        setEventos(novosEventos);
                        setEventosShares(novosEventosShares);
                    }
                } catch (error) {
                    console.log('Erro ao buscar eventos:', error.message);
                }
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [token, userData?.id, eventos, eventosShares]);

    

    const validarDatas = (inicio, termino) => {
        if (new Date(inicio) >= new Date(termino)) {
            return {error: "A data de início deve ser antes da data de término."};
        }
        const agora = new Date().getTime();
        if (new Date(inicio) < agora || new Date(termino) < agora) {
            return {error: "Não é possível adicionar eventos no passado!"} ;
        }
        return null;
    };

    const handleEditClick = (evento) => {
        setEditandoEventoId(evento.id);
        setEventoEditado({
            descricao: evento.descricao,
            inicio: evento.inicio,
            termino: evento.termino,
            // shared_users_id: evento.shared_users_id,
        });
    };

    const handleSaveEdit = async (id) => {
        const erro = validarDatas(eventoEditado.inicio, eventoEditado.termino);
        if (erro) {
            setMessages(prev => ({...prev,error: {...prev.error,[id]: erro}
            }));
            return;
        }
        await editEvento(eventos, id, eventoEditado, token, (msg) => {
            setMessages(prev => ({...prev,exito: {...prev.exito,[id]: msg}
            }));
        }, setEventos);
        setEditandoEventoId(null);
        setMessages({});
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };
    const eventosAgrupados = eventos ? agruparEventosPorMes(eventos.data) : {};
    const eventosFiltrados = eventosAgrupados 
    ? Object.keys(eventosAgrupados).reduce((acc, mes) => {

        const eventosFiltradosNoMes = eventosAgrupados[mes].filter(e => e.descricao.toLowerCase().includes(searchTerm));

        if (eventosFiltradosNoMes.length > 0) {
            acc[mes] = eventosFiltradosNoMes;
        }

        return acc;
    }, {}) 
    : {};
    return (
        <Container>
            <div className="section">
                <h2>Criar Novo Evento</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const inicio = formData.get("inicio");
                    const termino = formData.get("termino");
                    const compartilhar = formData.get("compartilhar");

                    const erro = validarDatas(inicio, termino);
                    if (erro) {
                        setMessage(erro);
                        return;
                    }
                    if (compartilhar && (!compartilhar.includes('@') || !compartilhar.includes('.'))) {
                        setMessage({error: 'Email não identificado, compartilhe através do email do usuário'});
                        return;
                    }

                    addEvento(eventos, e, token, userData, setMessage, setEventos, setEventosShares, null);
                }}>
                    <input type="text" name="descricao" placeholder="Descrição do evento" required />
                    <input type="datetime-local" name="inicio" required />
                    <input type="datetime-local" name="termino" required />
                    <input type="text" name="compartilhar" placeholder="(Opcional - Email) Compartilhar com... (Use ' ; ' para adicionar mais de um email)"/>
                    <button type="submit">Criar Evento</button>
                </form>
                {message && Object.entries(message).map(([key, text]) => (
                    <p key={key} className={`message ${key === "exito" ? "success" : "error"}`}>
                        {text}
                    </p>
                    ))}
            </div>

            <div className="section">
                <h2>Buscar Eventos</h2>
                <input type="text" placeholder="Digite para buscar eventos..." value={searchTerm} onChange={handleSearchChange} />
                <h2>Meus Eventos</h2>
                
                {Object.keys(eventosFiltrados).map((mes) => (
                <div key={mes} className="mes-div">
                    <h3>{mes[0].toUpperCase() + mes.slice(1)}</h3>
                    {eventosFiltrados[mes].map((e, index) => (
                        <div className={`event-card ${e.user_id?.id !== userData.id || (e.user_id?.id === userData.id && e.shared_users_id?.length > 0) ? 'compartilhado' : ''}`} key={e.id}>
                            {editandoEventoId === e.id ? (
                                <>
                                    {e.user_id?.id === userData.id ? (
                                    <><input
                                        type="text"
                                        value={eventoEditado.descricao}
                                        onChange={(ev) => setEventoEditado({ ...eventoEditado, descricao: ev.target.value })}
                                    />
                                    <input
                                        type="datetime-local"
                                        value={eventoEditado.inicio.substring(0, 16)}
                                        onChange={(ev) => setEventoEditado({ ...eventoEditado, inicio: converterParaUTC(ev.target.value) })}
                                    />
                                    <input
                                        type="datetime-local"
                                        value={eventoEditado.termino.substring(0, 16)}
                                        onChange={(ev) => setEventoEditado({ ...eventoEditado, termino: converterParaUTC(ev.target.value) })}
                                    />
                                    {console.log(eventoEditado)}
                                    {/* <p>{eventoEditado.shared_users_id.map((user) =>user.email)}</p>
                                    <input
                                        type="text"
                                        value={eventoEditado.shared_users_id}
                                        onChange={(ev) => setEventoEditado({ ...eventoEditado, shared_users_id: ev.target.value })}
                                    /> */}
                                    <button onClick={() => handleSaveEdit(e.documentId)}>Salvar</button></>
                                ):(
                                <>
                                    <p className="event-text">
                                        {index + 1} - {e.descricao} - {formatDate(e.inicio)} até {formatDate(e.termino)}
                                    </p>
                                </>
                                )}
                                    
                                    <button className="secondary" onClick={() => setEditandoEventoId(null)}>Cancelar</button>
                                    {e.user_id?.id === userData.id ?(
                                        <button className="danger" onClick={() => deleteEvento(e.documentId, token, setEventos, setMessage, setEditandoEventoId, userData, eventosShares)}>🗑️ Excluir</button>
                                    ):(
                                        <button className="danger" onClick={() => sairDoEvento(e.documentId, token, setEventos, setMessage, setEditandoEventoId, userData)}>Sair</button>
                                    )}
                                    

                                    {messages.error?.[e.documentId] && (
                                        <p className="message error">
                                            Erro no evento {e.documentId}: {messages.error[e.documentId]}
                                        </p>
                                    )}

                                    {messages.exito?.[e.documentId] && (
                                        <p className="message success">
                                            Evento {e.documentId}: {messages.exito[e.documentId]}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    {e.user_id?.id !== userData.id && <p className="event-text">Compartilhado por {e.user_id?.username}</p>}
                                    {e.user_id?.id === userData.id && e.shared_users_id?.length > 0 && (
                                        <p className="event-text">
                                            Compartilhado com {e.shared_users_id.map(usuario => usuario.username).join(", ")}
                                        </p>
                                    )}
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
                <h2>Convites para Eventos</h2>
                {eventosShares && eventosShares.data.filter(e => e.evento && e.users_ids).sort((a, b) => new Date(a.evento.inicio) - new Date(b.evento.inicio)).map((e, index) => (
                    <div  className="event-card">
                        <p key={e.evento.id}>{index + 1} - {e.evento.descricao} - {formatDate(e.evento.inicio)} até {formatDate(e.evento.termino)}</p>
                        <button onClick={async () => {
                            try {
                                const sucesso = await aceitarEvento(eventos, e.evento, token, userData, setMessages, setEventos, setEventosShares);
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
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
    }
    .success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    .error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
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
    .compartilhado {
        border: 1px solid #0056b3;
    }
    .event-text {
        font-size: 16px;
        font-weight: bold;
    }
`;


