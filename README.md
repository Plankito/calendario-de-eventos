# 📅 Tokenlab - Calendário de Eventos

Este é um sistema web desenvolvido como parte do desafio técnico da Tokenlab. O objetivo do projeto é fornecer um calendário de eventos onde os usuários possam cadastrar, visualizar, editar e excluir eventos.

## 🚀 Funcionalidades

- 📌 **Cadastro de usuário**  
- 🔐 **Login para acesso ao sistema**  
- 📝 **Criação de eventos com descrição, data e horário**  
- ✏️ **Edição de eventos**  
- ❌ **Remoção de eventos**  
- 📅 **Listagem de eventos cadastrados**  
- 👥 **Compartilhamento de eventos com outros usuários** (diferencial)  
- 📱 **Responsividade para dispositivos móveis** (diferencial)  

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- React.js (Next.js)

### **Backend**
- Strapi (Node.js)
- PostgreSQL
- JWT para autenticação

### **Outros**
- Fetch API para comunicação com o backend

## 🏗️ Como Executar o Projeto

### **1. Clonar o repositório**
```sh
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### **2. Configurar Backend**
```sh
cd backend
npm install
npm run develop
```
Certifique-se de configurar o Strapi corretamente e definir as variáveis de ambiente necessárias.

### **3. Configurar Frontend**
```sh
cd frontend
npm install
npm run dev
```
O projeto rodará em http://localhost:3000.

🔒 Autenticação
O sistema utiliza JWT para autenticação dos usuários.
Os tokens são armazenados via cookies.
