
const API_URL = process.env['NEXT_PUBLIC_API_URL'];
async function AddEvento(event, token, userData, setMessage, setEventos) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.target);
    let jsonData = Object.fromEntries(formData);

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
        const req = await fetch(`${API_URL}/api/eventos`, reqOptions);
        const res = await req.json();

        if (res.error) {
            setMessage(res.error.message || "Erro ao criar evento!");
            return;
        }

        setMessage("Evento criado com sucesso!");
        event.target.reset();

        const updatedEventosReq = await fetch(`${API_URL}/api/eventos/?filters[user_id][$eq]=${userData.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const updatedEventos = await updatedEventosReq.json();

        setEventos(updatedEventos);

    } catch (error) {
        console.error('Erro:', error);
        setMessage("Erro ao criar evento!");
    }
}



async function EditEvento(documentId, eventoEditado, token, setMessage, setEventos) {
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


function DeleteEvento({}){
    return
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
    AddEvento,
    EditEvento,
    DeleteEvento,
    formatDate
 };