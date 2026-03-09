# API de Pedidos - Desafio Técnico

## Sobre

A ideia é criar uma API que faz o CRUD completo de pedidos (criar, ler, atualizar e deletar).

## Tecnologias

- Node.js
- Express
- MongoDB com Mongoose
- dotenv

## Estrutura das pastas

```
src/
├── app.js              # arquivo principal
├── config/
│   └── database.js     # conexão com o mongo
├── controllers/
│   └── orderController.js
├── middleware/
│   └── errorHandler.js
├── models/
│   ├── Item.js
│   └── Order.js
├── routes/
│   └── orderRoutes.js
└── utils/
    └── dataMapper.js   # faz a transformação dos campos
```

## Como rodar

### Pré-requisitos

- Node.js instalado (v16+)
- MongoDB rodando (pode ser local ou Atlas)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/desafio_api.git
cd desafio_api
```

2. Instale as dependências:
```bash
npm install
```

3. Crie o arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

4. Configure o MongoDB no `.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/orders_db
NODE_ENV=development
```

Se for usar o MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/orders_db
```

## Rodando o projeto

```bash
npm start
```
e acessar: http://localhost:3000

## Rotas da API

| Método | Rota | O que faz |
|--------|------|-----------|
| POST | `/order` | Cria pedido novo |
| GET | `/order/:orderId` | Busca um pedido pelo ID |
| GET | `/order/list` | Lista todos os pedidos |
| PUT | `/order/:orderId` | Atualiza um pedido |
| DELETE | `/order/:orderId` | Deleta um pedido |

## Como funciona a transformação

Quando você manda um pedido assim:

```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```

A API salva no banco assim:

```json
{
  "orderId": "v10089015vdb-01",
  "value": 10000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1,
      "price": 1000
    }
  ]
}
```

Basicamente os campos são mapeados assim:
- `numeroPedido` -> `orderId`
- `valorTotal` -> `value`
- `dataCriacao` -> `creationDate`
- `idItem` -> `productId`
- `quantidadeItem` -> `quantity`
- `valorItem` -> `price`

## Exemplos com cURL

### Criar pedido
```bash
curl -X POST http://localhost:3000/order \
-H "Content-Type: application/json" \
-d '{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [{"idItem": "2434", "quantidadeItem": 1, "valorItem": 1000}]
}'
```

### Buscar pedido
```bash
curl http://localhost:3000/order/v10089015vdb-01
```

### Listar todos
```bash
curl http://localhost:3000/order/list
```

### Atualizar pedido
```bash
curl -X PUT http://localhost:3000/order/v10089015vdb-01 \
-H "Content-Type: application/json" \
-d '{"valorTotal": 15000}'
```

### Deletar pedido
```bash
curl -X DELETE http://localhost:3000/order/v10089015vdb-01
```

## Erros

A API retorna erros assim:
```json
{
  "success": false,
  "message": "Pedido não encontrado",
  "error": "ORDER_NOT_FOUND"
}
```

Status que podem voltar:
- 200/201 - deu certo
- 400 - dados inválidos
- 404 - não achou
- 409 - já existe
- 500 - erro no servidor

---
