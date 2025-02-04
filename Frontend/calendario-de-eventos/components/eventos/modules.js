
const API_URL = process.env['NEXT_PUBLIC_API_URL'];
async function addEvento(event, token, userData, setMessage, setEventos, setEventosShares, evento) {
    setMessage(null);

    let jsonData;

    if (event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        jsonData = Object.fromEntries(formData);
    } else if (evento) {
        jsonData = { ...evento };
    } else {
        setMessage("Nenhum dado de evento fornecido!");
        return;
    }
    jsonData.inicio = new Date(jsonData.inicio).toISOString();
    jsonData.termino = new Date(jsonData.termino).toISOString();

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
            const usernames = jsonData.compartilhar.includes(";")
                ? jsonData.compartilhar.split(";").map(name => name.trim())
                : [jsonData.compartilhar.trim()];

            for (const username of usernames) {
                const reqSec = await fetch(`${API_URL}/api/users/?filters[username][$eq]=${username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const resSec = await reqSec.json();
                if (resSec.length === 0) {
                    setMessage(`Usuário "${username}" não encontrado!`);
                    return;
                }

                userIds.push(resSec[0].id);
            }
        }

        const req = await fetch(`${API_URL}/api/eventos`, reqOptions);
        const res = await req.json();

        if (res.error) {
            setMessage(res.error.message || "Erro ao criar evento!");
            return;
        }

        setMessage("Evento criado com sucesso!");

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

    } catch (error) {
        console.error('Erro:', error);
        setMessage("Erro ao criar evento!");
    }
}


async function compartilharEvento(documentId, userData, userIds, token, setMessage, setEventosShares) {
    console.log("Compartilhando evento:", documentId, "com usuários:", userIds);

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
            setMessage("Evento compartilhado com sucesso!");

            const updatedSharesReq = await fetch(`${API_URL}/api/eventos-shares/?filters[users_ids][$eq]=${userData.id}&populate=*`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const updatedShares = await updatedSharesReq.json();

            setEventosShares(updatedShares);
        } else {
            setMessage(data.error?.message || "Erro ao compartilhar o evento!");
        }
    } catch (error) {
        console.error("Erro ao compartilhar evento:", error);
        setMessage("Erro ao compartilhar evento!");
    }
}

async function editEvento(documentId, eventoEditado, token, setMessage, setEventos) {
    setMessage(null);

    const reqOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: eventoEditado })
    };

    try {
        const req = await fetch(`${API_URL}/api/eventos/${documentId}`, reqOptions);
        const res = await req.json();

        if (res.error) {
            setMessage(res.error.message);
            return;
        }

        setEventos(prev => ({
            ...prev,
            data: prev.data.map(evento => evento.documentId === documentId ? res.data : evento)
        }));

        setMessage("Evento atualizado com sucesso!");
    } catch (error) {
        console.error('Erro ao editar evento:', error);
        setMessage("Erro ao editar evento.");
    }
}


async function deleteEvento(documentId, token, setEventos, setMessage, setEditandoEventoId, userData) {
    if (!documentId) return;
    
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este evento?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`http://localhost:1337/api/eventos/${documentId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) throw new Error("Erro ao excluir evento");

        setMessage("Evento excluído com sucesso!");
        setEditandoEventoId(null)
        
        const updatedEventosReq = await fetch(`${API_URL}/api/eventos/?filters[user_id][$eq]=${userData.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const updatedEventos = await updatedEventosReq.json();

        setEventos(updatedEventos);
        
    } catch (error) {
        setMessage("Erro ao excluir o evento");
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

        if (!response.ok) throw new Error("Erro ao recusar revento");

        setMessages("Evento recusado com sucesso!");
        
        const updatedEventosReqSec = await fetch(`${API_URL}/api/eventos-shares/?filters[users_ids][$eq]=${userData.id}&populate=*`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const updatedEventos = await updatedEventosReqSec.json();
        setEventosShares(updatedEventos);
        
    } catch (error) {
        setMessages("Erro ao recusar o evento");
    }

}

function formatDate(dateString) {
    if (!dateString) return "Data inválida";

    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

module.exports = {
    addEvento,
    editEvento,
    deleteEvento,
    recusarEvento,
    formatDate
 };