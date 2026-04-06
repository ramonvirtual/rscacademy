# 🎓 RSC Academy — Plataforma EdTech com IA + TRI + RAG

Plataforma educacional inteligente que integra:

* 🤖 Inteligência Artificial (IA)
* 🧮 Teoria de Resposta ao Item (TRI)
* 🎮 Gamificação
* 📊 Relatórios avançados de aprendizagem

**Stack:** Node.js + Express + JSON DB · React 18 + Vite · Claude AI (Anthropic) + OpenAI

> ✅ Banco JSON puro — sem SQLite, sem Python, sem compilação. Funciona direto no Windows.

---

# 🧠 Visão Geral

O **RSC Academy** é um LMS (Learning Management System) de nova geração que unifica ensino, avaliação, conteúdo e análise de desempenho em um único sistema.

🔹 Foco em aprendizagem adaptativa
🔹 Avaliação baseada em dados (TRI)
🔹 Engajamento com gamificação
🔹 IA integrada com RAG (contextual)

---

# 🏗️ Arquitetura

## 🔹 Tecnologias

* **Frontend:** React 18 + Vite
* **Backend:** Node.js + Express
* **Banco:** JSON estruturado
* **IA:** Claude (Anthropic) + OpenAI
* **Auth:** JWT + RBAC

---

## 📁 Estrutura do Projeto

```
rsc-academy/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── database/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── context/
│
└── README.md
```

---

# 🚀 Executar

## 🔧 Terminal 1 — Backend

```bash
cd rsc-academy\\backend
npm install
npm run dev
```

## 💻 Terminal 2 — Frontend

```bash
cd rsc-academy\\frontend
npm install
npm run dev
```

🌐 Acesse: **[http://localhost:5173](http://localhost:5173)**

---

# 🔐 Configuração (.env)

Crie o arquivo:

```
backend/.env
```

Exemplo:

```env
PORT=3000
JWT_SECRET=seu_secret_seguro

OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

⚠️ **NUNCA suba esse arquivo para o GitHub**

---

# 🔑 Credenciais

| Perfil    | E-mail                                            | Senha     |
| --------- | ------------------------------------------------- | --------- |
| Admin     | [admin@rsc.edu](mailto:admin@rsc.edu)             | Admin@123 |
| Professor | [ana@rsc.edu](mailto:ana@rsc.edu)                 | Prof@123  |
| Aluno     | [lucas@aluno.rsc.edu](mailto:lucas@aluno.rsc.edu) | Aluno@123 |
| Aluno     | [sofia@aluno.rsc.edu](mailto:sofia@aluno.rsc.edu) | Aluno@123 |

---

# 🤖 Inteligência Artificial

A IA no sistema permite:

* ✔️ Geração automática de questões
* ✔️ Correção de respostas dissertativas
* ✔️ Chatbot pedagógico com RAG
* ✔️ Sugestão de parâmetros TRI

### 🔑 Configuração

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

---

# 📋 Módulos Implementados

## 👑 Admin

* Dashboard com estatísticas reais
* CRUD completo de usuários
* Aprovação de cadastros
* Relatórios globais (usuários, desempenho, TRI)

---

## 👨‍🏫 Professor

* Disciplinas (CRUD)
* Trilhas gamificadas
* Banco de questões (7 tipos)
* Geração de questões com IA + RAG
* Turmas com código de acesso
* Mural de avisos
* Materiais didáticos
* Avaliações (prova, quiz, simulado, trabalho)
* Relatórios TRI por aluno

---

## 👨‍🎓 Aluno

* Entrada em turma por código
* Trilhas gamificadas (XP, tempo, progresso)
* Player de desafios
* Feedback automático com IA
* Visualização da curva TRI
* Boletim e desempenho (θ)
* Materiais e mural
* Chatbot educacional

---

# 🧩 Tipos de Questões (7)

* Múltipla Escolha (3PL)
* Verdadeiro/Falso (1PL)
* Dissertativa (GRM + IA)
* Preenchimento (2PL)
* Associação (2PL)
* Ordenação (2PL)
* Upload/Entrega (GRM)

---

# 🧮 Arquitetura TRI

| Modelo      | Uso                                  |
| ----------- | ------------------------------------ |
| 1PL (Rasch) | Verdadeiro/Falso                     |
| 2PL         | Associação, Ordenação, Preenchimento |
| 3PL         | Múltipla Escolha                     |
| GRM         | Dissertativa, Upload                 |

📊 **Estimação θ:** EAP (Expected A Posteriori)
📈 **Intervalo:** -4 a +4
⚙️ **Calibração:** automática após 30+ respostas

---

# 🎮 Gamificação

* Sistema de XP por questão
* Níveis de habilidade (Iniciante → Lendário)
* Medalhas e conquistas
* Trilhas progressivas

---

# 🔌 API Endpoints

```
/api/auth         → login, register, me
/api/users        → CRUD (admin)
/api/disciplinas  → CRUD
/api/trilhas      → CRUD
/api/questoes     → CRUD + IA + TRI
/api/respostas    → submissão + progresso
/api/turmas       → CRUD + entrada por código
/api/materiais    → CRUD
/api/avisos       → CRUD
/api/relatorios   → dashboards e análises
```

---

# 🔄 Fluxo do Sistema

1. Login → geração de JWT
2. Autorização por perfil (RBAC)
3. Consumo de conteúdo
4. Resposta → cálculo TRI (θ)
5. Feedback com IA
6. Atualização de XP e progresso

---

# 🔐 Segurança

* JWT Authentication
* RBAC (controle por perfil)
* Senhas com bcrypt
* Variáveis de ambiente (.env)
* Proteção contra vazamento de secrets

---

# 📈 Boas Práticas

✔️ Nunca subir `.env`
✔️ Usar `.env.example`
✔️ Separar frontend/backend
✔️ Versionar apenas código seguro

---

# 🗺️ Próximas Etapas (Roadmap)

* [ ] Avaliações formais com nota final
* [ ] Upload real de arquivos (multer)
* [ ] Notificações em tempo real (Socket.io)
* [ ] Multi-tenant (customização por escola)
* [ ] RAG com embeddings reais
* [ ] Deploy em nuvem (Azure / VPS)

---

# 🏆 Diferenciais

✔️ IA integrada com contexto (RAG)
✔️ Avaliação científica com TRI
✔️ Gamificação real (XP + níveis)
✔️ Arquitetura simples e eficiente
✔️ Plataforma educacional completa

---

# 👨‍💻 Autor

**Ramon Santos Costa**
Projeto: **RSC Academy**

---

# 📄 Licença

Uso acadêmico e educacional.
