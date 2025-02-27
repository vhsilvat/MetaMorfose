# MetaMorfose - Sistema de Acompanhamento Hol�stico de Sa�de e Desempenho F�sico

## Vis�o Geral

MetaMorfose � um sistema personalizado para acompanhamento integrado de treinos, nutri��o, sono, produtividade e bem-estar geral, com gera��o din�mica de planos e recomenda��es baseadas em dados coletados e processados por IA.

## Objetivos Principais

- Maximizar ganho de massa magra
- Aprimorar condicionamento f�sico
- Otimizar sa�de geral atrav�s de abordagem sistem�tica baseada em dados
- Criar um ciclo cont�nuo de coleta de dados, processamento, gera��o de insights e implementa��o de ajustes

## Stack Tecnol�gica

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI
- **Backend/BaaS**: Convex (Backend reativo em TypeScript)
- **Autentica��o**: Clerk
- **IA**: Anthropic Claude API
- **Analytics**: PostHog
- **Pagamentos**: Stripe

## Configura��o do Projeto

### Pr�-requisitos

- Node.js 18+ e npm
- Conta no Clerk para autentica��o
- Conta no Convex para backend
- Conta na Anthropic para API Claude
- Conta no Stripe para pagamentos (opcional para desenvolvimento)
- Conta no PostHog para analytics (opcional para desenvolvimento)

### Instala��o

1. Clone o reposit�rio
```bash
git clone https://github.com/seu-usuario/metamorfose.git
cd metamorfose
```

2. Instale as depend�ncias
```bash
npm install
```

3. Configure as vari�veis de ambiente
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

6. Acesse a aplica��o em [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
/app                    # Rotas e componentes de p�gina (Next.js App Router)
  /api                  # Rotas de API
  /dashboard            # �rea principal p�s-login
  /anamnese             # Fluxo de anamnese
  /...                  # Outras p�ginas da aplica��o
/components             # Componentes reutiliz�veis
  /ui                   # Componentes de UI (bot�es, cards, etc.)
  /forms                # Componentes de formul�rio
  /dashboard            # Componentes espec�ficos do dashboard
/lib                    # Utilit�rios, hooks e constantes
  /utils                # Fun��es utilit�rias
  /hooks                # React hooks customizados
  /constants            # Constantes da aplica��o
  /validations          # Esquemas de valida��o (zod)
/convex                 # Defini��es de backend
  /schema               # Esquema do banco de dados
  /actions              # Mutations e actions
  /queries              # Queries
  /auth                 # L�gica de autentica��o
  /utils                # Utilit�rios do backend
/public                 # Assets est�ticos
```

## Fluxo de Anamnese

O sistema implementa uma anamnese progressiva em 5 etapas:

1. **Etapa 1 (Dia 1)**: Dados essenciais (idade, objetivos principais, experi�ncia pr�via)
2. **Etapa 2 (Dia 3)**: Hist�rico de treino e les�es
3. **Etapa 3 (Dia 7)**: Avalia��es posturais visuais e medidas b�sicas
4. **Etapa 4 (Contextual)**: Prefer�ncias nutricionais e alergias
5. **Etapa 5 (Baseada em uso)**: Ajustes finos baseados em padr�es observados

## Comandos Principais

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera a vers�o de produ��o
- `npm start`: Inicia o servidor de produ��o
- `npm run lint`: Executa o linter
- `npm run convex`: Inicia o servidor de desenvolvimento do Convex

## Contribui��o

1. Fa�a um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Fa�a commit de suas mudan�as (`git commit -m 'Adiciona nova feature'`)
4. Fa�a push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licen�a

[MIT](LICENSE)