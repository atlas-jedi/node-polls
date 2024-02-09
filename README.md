
# Node Polls

Node Polls é um sistema backend, construído em Node.js, no qual realiza enquetes com atualização em tempo real do score de votação através de websockets.

## Instalação

1. Clone este repositório:

```bash
  git clone https://github.com/atlas-jedi/node-polls.git
```

2. Instale as dependências (Node v20.11.0):
```bash
  cd node-polls
  npm install
```

3. Inicie os containers (Postgresql e Redis)
```bash
  docker compose up -d
```

4. Execute o servidor de desenvolvimento
```bash
  npm run dev
```


## Tecnologias Uitlizadas

- Node.js
- Fastify
- Prisma
- Redis
- WebSockets
- Typescript


O servidor HTTP é construído com Fastify, um framework web de alta eficiência por ser rápido e de baixo custo. O Prisma é usado como ORM para facilitar a interação com o banco de dados. O Redis foi utilizado para gerenciar o score de votação em conjunto de websockets para que a aplicação possua uma comunicação em tempo real das atualizações de votos de forma independente do banco de dados principal.
## Documentação da API

#### Retorna uma enquete específica com seus itens

```http
  GET /polls/:pollId
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `pollId`    | `string`   | **Obrigatório**. ID da enquete a ser retornada |

#### Cria uma enquete

```http
  POST /polls
```

- Corpo da requisição (JSON):

```json
  {
    "title": "Nome da enquete",
    "options": ["Opção 1", "Opção 2", "Opção 3"]
  }
```

#### Vota em um item específico em uma enquete específica

```http
  POST /polls/:pollId
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `pollId`    | `string`   | **Obrigatório**. ID da enquete a ser votada |


- Corpo da requisição (JSON):

```json
  {
    "pollOptionId": "ID do item a ser votado"
  }
```

### Canal de comunicação websocket
- Protocolo de comunicação websocket [ws://localhost:3333/]

```ws
  GET /polls/:pollId/results
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `pollId`    | `string`   | **Obrigatório**. ID da enquete para ouvir as atualizações de score |

O retorno será um objeto com cada item já votado e seu score.

## Contribuindo

Contribuições são sempre bem-vindas! Sinta-se à vontade para abrir um pull request com melhorias ou correções.