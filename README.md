# MetaMorfose - Sistema de Acompanhamento Holístico de Saúde e Desempenho Físico

## Visão Geral

MetaMorfose é um sistema personalizado para acompanhamento integrado de treinos, nutrição, sono, produtividade e bem-estar geral, com geração dinâmica de planos e recomendações baseadas em dados coletados e processados por IA.

## Objetivos Principais

- Maximizar ganho de massa magra
- Aprimorar condicionamento físico
- Otimizar saúde geral através de abordagem sistemática baseada em dados
- Criar um ciclo contínuo de coleta de dados, processamento, geração de insights e implementação de ajustes

## Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI
- **Backend/BaaS**: Convex (Backend reativo em TypeScript)
- **Autenticação**: Clerk
- **IA**: Anthropic Claude API
- **Analytics**: PostHog
- **Pagamentos**: Stripe

## Configuração do Projeto

### Pré-requisitos

- Node.js 18+ e npm
- Conta no Clerk para autenticação
- Conta no Convex para backend
- Conta na Anthropic para API Claude
- Conta no Stripe para pagamentos (opcional para desenvolvimento)
- Conta no PostHog para analytics (opcional para desenvolvimento)

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/metamorfose.git
cd metamorfose
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```
Edite o arquivo `.env.local` e preencha com suas credenciais.

4. Inicie o servidor de desenvolvimento do Convex
```bash
npm run convex
```

5. Em outro terminal, inicie o servidor de desenvolvimento Next.js
```bash
npm run dev
```

6. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
/app                    # Rotas e componentes de página (Next.js App Router)
  /api                  # Rotas de API
  /dashboard            # Área principal pós-login
  /anamnese             # Fluxo de anamnese
  /...                  # Outras páginas da aplicação
/components             # Componentes reutilizáveis
  /ui                   # Componentes de UI (botões, cards, etc.)
  /forms                # Componentes de formulário
  /dashboard            # Componentes específicos do dashboard
/lib                    # Utilitários, hooks e constantes
  /utils                # Funções utilitárias
  /hooks                # React hooks customizados
  /constants            # Constantes da aplicação
  /validations          # Esquemas de validação (zod)
/convex                 # Definições de backend
  /schema               # Esquema do banco de dados
  /actions              # Mutations e actions
  /queries              # Queries
  /auth                 # Lógica de autenticação
  /utils                # Utilitários do backend
/public                 # Assets estáticos
```

## Fluxo de Anamnese

O sistema implementa uma anamnese progressiva em 5 etapas:

1. **Etapa 1 (Dia 1)**: Dados essenciais (idade, objetivos principais, experiência prévia)
2. **Etapa 2 (Dia 3)**: Histórico de treino e lesões
3. **Etapa 3 (Dia 7)**: Avaliações posturais visuais e medidas básicas
4. **Etapa 4 (Contextual)**: Preferências nutricionais e alergias
5. **Etapa 5 (Baseada em uso)**: Ajustes finos baseados em padrões observados

## Comandos Principais

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera a versão de produção
- `npm start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter
- `npm run convex`: Inicia o servidor de desenvolvimento do Convex

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit de suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

[MIT](LICENSE)