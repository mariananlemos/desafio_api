/**
 * API de Gerenciamento de Pedidos
 * 
 * Aplicação principal que inicializa o servidor Express,
 * configura middlewares e conecta ao banco de dados MongoDB.
 * 
 * Desenvolvido como parte do Desafio Técnico - Jitterbit
 * 
 * @author Mariana
 * @version 1.0.0
 */

// Carrega as variáveis de ambiente
require('dotenv').config();

// Importações de dependências
const express = require('express');

// Importações de módulos locais
const connectDatabase = require('./config/database');
const orderRoutes = require('./routes/orderRoutes');
const { 
    notFoundHandler, 
    errorHandler, 
    validateContentType, 
    requestLogger 
} = require('./middleware/errorHandler');

// Inicializa a aplicação Express
const app = express();

// Porta do servidor (padrão: 3000)
const PORT = process.env.PORT || 3000;

/**
 * ========================================
 * CONFIGURAÇÃO DE MIDDLEWARES
 * ========================================
 */

// Middleware para parsing de JSON no body das requisições
app.use(express.json({ limit: '10mb' }));

// Middleware para parsing de dados URL encoded
app.use(express.urlencoded({ extended: true }));

// Middleware de logging de requisições (em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    app.use(requestLogger);
}

// Middleware para validação de Content-Type
app.use(validateContentType);

// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
// Permite requisições de diferentes origens
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Responde requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

/**
 * ========================================
 * ROTAS DA API
 * ========================================
 */

// Rota de health check - verifica se a API está funcionando
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API está funcionando corretamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rota raiz - informações básicas da API
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API de Gerenciamento de Pedidos',
        version: '1.0.0',
        endpoints: {
            'POST /order': 'Criar um novo pedido',
            'GET /order/:orderId': 'Obter pedido por ID',
            'GET /order/list': 'Listar todos os pedidos',
            'PUT /order/:orderId': 'Atualizar pedido',
            'DELETE /order/:orderId': 'Excluir pedido'
        },
        documentation: 'Consulte o README.md para mais informações'
    });
});

// Rotas de pedidos
app.use('/order', orderRoutes);

/**
 * ========================================
 * MIDDLEWARES DE ERRO
 * ========================================
 */

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware global de tratamento de erros
app.use(errorHandler);

/**
 * ========================================
 * INICIALIZAÇÃO DO SERVIDOR
 * ========================================
 */

/**
 * Função assíncrona para iniciar o servidor
 * Conecta ao banco de dados antes de iniciar o servidor HTTP
 */
const startServer = async () => {
    try {
        // Conecta ao banco de dados MongoDB
        await connectDatabase();

        // Inicia o servidor HTTP
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log('🚀 API de Gerenciamento de Pedidos');
            console.log('='.repeat(50));
            console.log(`📡 Servidor rodando na porta ${PORT}`);
            console.log(`🌍 URL: http://localhost:${PORT}`);
            console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log('='.repeat(50));
            console.log('\n📋 Endpoints disponíveis:');
            console.log(`   POST   http://localhost:${PORT}/order`);
            console.log(`   GET    http://localhost:${PORT}/order/:orderId`);
            console.log(`   GET    http://localhost:${PORT}/order/list`);
            console.log(`   PUT    http://localhost:${PORT}/order/:orderId`);
            console.log(`   DELETE http://localhost:${PORT}/order/:orderId`);
            console.log('='.repeat(50));
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar o servidor:', error.message);
        process.exit(1);
    }
};

// Inicia o servidor
startServer();

// Exporta a app para testes
module.exports = app;
