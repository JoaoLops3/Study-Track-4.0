# Study Track 4.0

Uma aplicação web moderna para gerenciamento de estudos, combinando técnicas de produtividade como Pomodoro, gerenciamento de tarefas e integração com ferramentas populares.

## 🚀 Funcionalidades

- ⏱️ **Pomodoro Timer**

  - Timer personalizável
  - Modos: Foco, Pausa Curta, Pausa Longa
  - Timer flutuante
  - Estatísticas de sessões

- ✅ **Gerenciamento de Tarefas**

  - CRUD completo de tarefas
  - Categorização
  - Prioridades
  - Datas de entrega

- 📊 **Dashboard**

  - Visão geral do progresso
  - Estatísticas de estudo
  - Integração com GitHub
  - Calendário de atividades

- 🔄 **Integrações**
  - GitHub (commits e repositórios)
  - Google Calendar
  - Sistema de notificações

## 🛠️ Tecnologias

- **Frontend**

  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Zustand (Gerenciamento de Estado)
  - React Query

- **Backend**
  - Supabase
    - PostgreSQL
    - Autenticação
    - Storage
    - Row Level Security

## 🚀 Como Executar

1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/study-track-4.0.git
cd study-track-4.0
```

2. Instale as dependências

```bash
npm install
```

3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase

4. Execute o projeto

```bash
npm run dev
```

## 📦 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── contexts/      # Contextos React
├── pages/         # Páginas da aplicação
├── lib/           # Configurações e utilitários
└── assets/        # Recursos estáticos
```

## 🔒 Autenticação

- Login com email/senha
- Autenticação social (Google, GitHub)
- Recuperação de senha
- Proteção de rotas

## 🎨 Interface

- Design moderno e intuitivo
- Tema claro/escuro
- Totalmente responsivo
- Componentes reutilizáveis

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, envie um email para seu-email@exemplo.com ou abra uma issue no GitHub.
