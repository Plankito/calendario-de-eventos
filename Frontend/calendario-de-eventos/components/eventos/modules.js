
const API_URL = process.env['NEXT_PUBLIC_API_URL'];

function verificaConflito(eventos, evento, documentId) {
    if (!eventos || !Array.isArray(eventos.data)) {
        return null;
    }

    return eventos.data.find(e => {
        if (documentId){
            if (e.documentId === documentId) {
                return false;
            }
        }

        const inicioExistente = new Date(e.inicio).getTime();
        const terminoExistente = new Date(e.termino).getTime();
        const novoInicio = new Date(evento.inicio).getTime();
        const novoTermino = new Date(evento.termino).getTime();

        return (
            (novoInicio >= inicioExistente && novoInicio < terminoExistente) ||
            (novoTermino > inicioExistente && novoTermino <= terminoExistente) ||
            (novoInicio <= inicioExistente && novoTermino >= terminoExistente)
        );
    });
}
function converterParaUTC(dateString) {
    const dataLocal = new Date(dateString);
    const dataUC = new Date(dataLocal.getTime() - dataLocal.getTimezoneOffset() * 60000);
    return dataUC.toISOString();
}

async function addEvento(eventos, event, token, userData, setMessage, setEventos, setEventosShares, evento) {
    setMessage(null);

    let jsonData;

    if (event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        jsonData = Object.fromEntries(formData);
    } else if (evento) {
        jsonData = { ...evento };
    } else {
        setMessage({error: "Nenhum dado de evento fornecido!"});
        return;
    }
    jsonData.inicio = converterParaUTC(jsonData.inicio);
    jsonData.termino = converterParaUTC(jsonData.termino);

    const conflito = verificaConflito(eventos, jsonData);

    if (conflito) {
        setMessage({error: `Conflito com evento "${conflito.descricao}" de ${new Date(conflito.inicio).toLocaleString()} até ${new Date(conflito.termino).toLocaleString()}.`});
        alert(`Conflito com evento "${conflito.descricao}" de ${new Date(conflito.inicio).toLocaleString()} até ${new Date(conflito.termino).toLocaleString()}.`)
        return;
    }

    const requestBody = {
        data: {
            descricao: jsonData.descricao,
            inicio: jsonData.inicio,
            termino: jsonData.termino,
            user_id: userData.id
        }
    };

    const reqOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
    };

    try {
        let userIds = [];

        if (jsonData.compartilhar) {
            const emails = jsonData.compartilhar.includes(";")
                ? jsonData.compartilhar.split(";").map(name => name.trim())
                : [jsonData.compartilhar.trim()];

            for (const email of emails) {
                if (email === userData.email) {
                    setMessage({error: "Você não pode compartilhar com você mesmo!"});
                    return;
                }
                const reqSec = await fetch(`${API_URL}/api/users/?filters[email][$eq]=${email}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const resSec = await reqSec.json();
                if (resSec.length === 0) {
                    setMessage({error: `Usuário de E-mail: "${email}" não encontrado!`});
                    return;
                }

                userIds.push(resSec[0].id);
            }
        }

        const req = await fetch(`${API_URL}/api/eventos`, reqOptions);
        const res = await req.json();

        if (res.error) {
            setMessage({error: res.error.message} || {error: "Erro ao criar evento!"});
            return;
        }

        setMessage({exito: "Evento criado com sucesso!"});

        if (event) {
            event.target.reset();
        }

        const updatedEventosReq = await fetch(`${API_URL}/api/eventos/?filters[user_id][$eq]=${userData.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const updatedEventos = await updatedEventosReq.json();
        setEventos(updatedEventos);

        if (userIds.length > 0) {
            compartilharEvento(res.data.documentId, userData, userIds, token, setMessage, setEventosShares);
        }
        return res?.data;

    } catch (error) {
        console.error('Erro:', error);
        setMessage({error: "Erro ao criar evento!"});
    }
}


async function compartilharEvento(documentId, userData, userIds, token, setMessage, setEventosShares) {
    const requestBody = {
        data: {
            evento: documentId,
            users_ids: Array.isArray(userIds) ? userIds : [userIds]
        }
    };

    const reqOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
    };

    try {
        const response = await fetch(`${API_URL}/api/eventos-shares`, reqOptions);
        const data = await response.json();

        if (response.ok) {
            setMessage({exito: "Evento compartilhado com sucesso!"});

            const updatedSharesReq = await fetch(`${API_URL}/api/eventos-shares/?filters[users_ids][$eq]=${userData.id}&populate=*`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const updatedShares = await updatedSharesReq.json();

            setEventosShares(updatedShares);
        } else {
            setMessage({error: data.error?.message} || {error: "Erro ao compartilhar o evento!"});
        }
    } catch (error) {
        console.error("Erro ao compartilhar evento:", error);
        setMessage({error: "Erro ao compartilhar evento!"});
    }
}

async function editEvento(eventos, documentId, eventoEditado, token, setMessage, setEventos) {
    setMessage(null);

    const reqOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: eventoEditado })
    };

    const conflito = verificaConflito(eventos, eventoEditado, documentId);

    if (conflito) {
        setMessage({error: `Conflito com evento "${conflito.descricao}" de ${new Date(conflito.inicio).toLocaleString()} até ${new Date(conflito.termino).toLocaleString()}.`});
        alert(`Conflito com evento "${conflito.descricao}" de ${new Date(conflito.inicio).toLocaleString()} até ${new Date(conflito.termino).toLocaleString()}.`)
        return;
    }


    try {
        const req = await fetch(`${API_URL}/api/eventos/${documentId}`, reqOptions);
        const res = await req.json();

        if (res.error) {
            setMessage({error: res.error.message});
            return;
        }

        setEventos(prev => ({
            ...prev,
            data: prev.data.map(evento => evento.documentId === documentId ? res.data : evento)
        }));

        setMessage({exito: "Evento atualizado com sucesso!"});
    } catch (error) {
        console.error('Erro ao editar evento:', error);
        setMessage({error: "Erro ao editar evento."});
    }
}


async function deleteEvento(documentId, token, setEventos, setMessage, setEditandoEventoId, userData, eventosShares) {
    if (!documentId) return;

    const confirmDelete = window.confirm("Tem certeza que deseja excluir este evento?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/api/eventos/${documentId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) throw new Error("Erro ao excluir evento");

        setMessage({exito: "Evento excluído com sucesso!"});
        setEditandoEventoId(null);

        if (eventosShares) {
            const deleteRequests = eventosShares.data
                .filter(e => e.evento === null)
                .map(e =>
                    fetch(`${API_URL}/api/eventos-shares/${e.documentId}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    })
                );

            const deleteResponses = await Promise.all(deleteRequests);

            const failedDeletes = deleteResponses.filter(res => !res.ok);
            if (failedDeletes.length > 0) {
                setMessage({error: "Erro ao excluir alguns eventos compartilhados."});
            }
        }

        const updatedEventosReq = await fetch(`${API_URL}/api/eventos/?filters[user_id][$eq]=${userData.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const updatedEventos = await updatedEventosReq.json();

        setEventos(updatedEventos);
        
    } catch (error) {
        setMessage({error: "Erro ao excluir o evento."});
    }
}


async function recusarEvento(documentId, token, userData, setEventosShares, setMessages, pular){
    if (!documentId) return;
    if (!pular){
        const confirmRecusa = window.confirm("Tem certeza que deseja recusar este evento?");
        if (!confirmRecusa) return;
    }
    

    const updatedEventosReq = await fetch(`${API_URL}/api/eventos-shares/${documentId}/?populate=*`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const updatedEventosMinus = await updatedEventosReq.json();
    const users_ids_atualizado = [];

    updatedEventosMinus.data.users_ids.map((e)=>{
        if (e.id !== userData.id){
            users_ids_atualizado.push(e.id)
        }
    })

    const requestBody = {
            data: {
              users_ids: users_ids_atualizado
            }
    };

    try {
        const response = await fetch(`${API_URL}/api/eventos-shares/${documentId}/?populate=*`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error("Erro ao recusar evento");

        setMessages({exito: "Evento recusado com sucesso!"});

        if (users_ids_atualizado.length === 0){
            const response = await fetch(`${API_URL}/api/eventos-shares/${documentId}`,{
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) throw new Error("Erro ao deletar evento");
        }
        const updatedEventosReqSec = await fetch(`${API_URL}/api/eventos-shares/?filters[users_ids][$eq]=${userData.id}&populate=*`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const updatedEventos = await updatedEventosReqSec.json();
        setEventosShares(updatedEventos);
        
    } catch (error) {
        setMessages({error: "Erro ao recusar o evento"});
    }

}

function formatDate(dateString) {
    if (!dateString) return "Data inválida";

    const date = new Date(dateString);
    date.setHours(date.getHours() + 3);
    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


function agruparEventosPorMes(eventos){
    return eventos.reduce((acc, evento) => {
        const dataInicio = new Date(evento.inicio);
        const mesAno = dataInicio.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!acc[mesAno]) {
            acc[mesAno] = [];
        }

        acc[mesAno].push(evento);
        return acc;
    }, {});
};

module.exports = {
    addEvento,
    editEvento,
    deleteEvento,
    recusarEvento,
    formatDate,
    agruparEventosPorMes
 };