/**
 * Middleware de Tratamento de Erros
 * 
 * Este módulo contém middlewares globais para tratamento de erros
 * e validação de requisições na API.
 */

/**
 * Middleware para tratar rotas não encontradas (404)
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
        error: 'NOT_FOUND'
    });
};

/**
 * Middleware global de tratamento de erros
 * 
 * Captura e trata todos os erros não tratados nos controllers
 * 
 * @param {Error} err - Objeto de erro
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const errorHandler = (err, req, res, next) => {
    // Log do erro no console (em ambiente de desenvolvimento)
    console.error('Erro não tratado:', err);

    // Define o status code baseado no erro
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Erro interno do servidor';

    // Tratamento específico para diferentes tipos de erro
    if (err.name === 'ValidationError') {
        // Erro de validação do Mongoose
        statusCode = 400;
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(statusCode).json({
            success: false,
            message: 'Erro de validação',
            errors: messages
        });
    }

    if (err.name === 'CastError') {
        // Erro de conversão de tipo (ex: ID inválido)
        statusCode = 400;
        message = 'Formato de dados inválido';
    }

    if (err.code === 11000) {
        // Erro de duplicidade (chave única)
        statusCode = 409;
        message = 'Registro duplicado';
    }

    if (err.name === 'SyntaxError' && err.type === 'entity.parse.failed') {
        // Erro de parsing JSON
        statusCode = 400;
        message = 'JSON inválido no corpo da requisição';
    }

    // Resposta de erro
    res.status(statusCode).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? {
            name: err.name,
            stack: err.stack
        } : 'INTERNAL_ERROR'
    });
};

/**
 * Middleware para validar Content-Type
 * 
 * Verifica se requisições POST/PUT possuem Content-Type application/json
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const validateContentType = (req, res, next) => {
    // Verifica apenas requisições que devem ter body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];
        
        // Aceita requisições sem body ou com content-type correto
        if (contentType && !contentType.includes('application/json')) {
            return res.status(415).json({
                success: false,
                message: 'Content-Type deve ser application/json',
                error: 'UNSUPPORTED_MEDIA_TYPE'
            });
        }
    }
    
    next();
};

/**
 * Middleware para logging de requisições
 * 
 * Registra informações sobre cada requisição recebida
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
};

module.exports = {
    notFoundHandler,
    errorHandler,
    validateContentType,
    requestLogger
};
