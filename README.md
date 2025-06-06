# Study Track 🌱

## Sobre o Projeto

O Study Track é uma aplicação moderna e intuitiva desenvolvida para auxiliar estudantes e profissionais na organização e otimização de seus estudos. Combinando técnicas de produtividade com gamificação, o aplicativo oferece uma experiência única de aprendizado e desenvolvimento pessoal.

## 🚀 Funcionalidades Principais

### 📅 Calendário Inteligente

- Integração com Google Calendar
- Visualização de eventos e compromissos
- Gerenciamento de horários de estudo
- Interface intuitiva e responsiva

### 🌳 Sistema de Foco (Forest)

- Timer configurável para períodos de estudo
- Plantio de árvores virtuais durante o foco
- Sistema de recompensas e conquistas
- Floresta virtual personalizada
- Insígnias por conquistas
- Progresso semanal

### 📊 Métricas e Progresso

- Acompanhamento de tempo de estudo
- Estatísticas detalhadas de produtividade
- Visualização de progresso em gráficos
- Histórico de sessões
- Sistema de conquistas
- Progresso semanal detalhado

## 🛠️ Tecnologias Utilizadas

- **Frontend**

  - React
  - TypeScript
  - Tailwind CSS
  - Lucide Icons
  - ESLint
  - Prettier

- **Backend**

  - Supabase
    - PostgreSQL
  - Google Calendar API

- **Autenticação**

  - Supabase Auth
  - Google OAuth

- **Gerenciamento de Estado**
  - Context API
  - Custom Hooks

## 🚀 Como Começar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase
- Credenciais do Google Cloud Platform

### Instalação

1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/study-track.git
```

2. Instale as dependências

```bash
cd study-track
npm install
```

3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

4. Inicie o projeto

```bash
npm run dev
```

## 🔧 Configuração do Ambiente

1. Crie um projeto no Supabase e configure as variáveis de ambiente:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Configure o Google Cloud Platform:
   - Crie um projeto
   - Ative a Google Calendar API
   - Configure as credenciais OAuth
   - Adicione as variáveis de ambiente:
     - `VITE_GOOGLE_CLIENT_ID`
     - `VITE_GOOGLE_CLIENT_SECRET`

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Agradecimentos

- [Forest App](https://www.forestapp.cc/) pela inspiração no sistema de foco
- [Supabase](https://supabase.io/) pelo backend robusto
- [Tailwind CSS](https://tailwindcss.com/) pelo framework de estilização
- [Lucide Icons](https://lucide.dev/) pelos ícones

## 📞 Suporte

Para suporte, envie um email para seu-email@exemplo.com ou abra uma issue no GitHub.

---

Desenvolvido com ❤️ por [Seu Nome]
