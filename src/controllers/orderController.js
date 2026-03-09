/**
 * Controller de Pedidos (Orders)
 * 
 * Este módulo contém todas as funções de controle para as operações
 * CRUD de pedidos. Cada função manipula uma operação específica da API.
 */

const Order = require('../models/Order');
const { transformOrderInput, transformOrderOutput, transformOrderUpdate } = require('../utils/dataMapper');

/**
 * Cria um novo pedido
 * 
 * POST /order
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Pedido criado ou mensagem de erro
 */
const createOrder = async (req, res) => {
    try {
        // Valida se o body foi fornecido
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'O corpo da requisição não pode estar vazio',
                error: 'EMPTY_BODY'
            });
        }

        // Valida campos obrigatórios
        const { numeroPedido, valorTotal, items } = req.body;
        
        if (!numeroPedido) {
            return res.status(400).json({
                success: false,
                message: 'O campo numeroPedido é obrigatório',
                error: 'MISSING_FIELD'
            });
        }

        if (valorTotal === undefined || valorTotal === null) {
            return res.status(400).json({
                success: false,
                message: 'O campo valorTotal é obrigatório',
                error: 'MISSING_FIELD'
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'O pedido deve conter pelo menos um item',
                error: 'MISSING_ITEMS'
            });
        }

        // Verifica se já existe um pedido com o mesmo número
        const existingOrder = await Order.findByOrderId(numeroPedido);
        if (existingOrder) {
            return res.status(409).json({
                success: false,
                message: `Já existe um pedido com o número ${numeroPedido}`,
                error: 'DUPLICATE_ORDER'
            });
        }

        // Transforma os dados para o formato do banco
        const transformedData = transformOrderInput(req.body);

        // Cria o novo pedido no banco de dados
        const newOrder = new Order(transformedData);
        await newOrder.save();

        // Retorna o pedido criado com status 201 (Created)
        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso',
            data: transformOrderOutput(newOrder)
        });

    } catch (error) {
        // Trata erros de validação do Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Erro de validação dos dados',
                errors: messages
            });
        }

        // Trata erros de duplicidade (índice único)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Já existe um pedido com este número',
                error: 'DUPLICATE_ORDER'
            });
        }

        // Erro interno do servidor
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao criar o pedido',
            error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
        });
    }
};

/**
 * Obtém um pedido pelo número do pedido
 * 
 * GET /order/:orderId
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Pedido encontrado ou mensagem de erro
 */
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Valida se o orderId foi fornecido
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'O número do pedido é obrigatório',
                error: 'MISSING_ORDER_ID'
            });
        }

        // Busca o pedido no banco de dados
        const order = await Order.findByOrderId(orderId);

        // Verifica se o pedido foi encontrado
        if (!order) {
            return res.status(404).json({
                success: false,
                message: `Pedido ${orderId} não encontrado`,
                error: 'ORDER_NOT_FOUND'
            });
        }

        // Retorna o pedido encontrado
        res.status(200).json({
            success: true,
            data: transformOrderOutput(order)
        });

    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao buscar o pedido',
            error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
        });
    }
};

/**
 * Lista todos os pedidos
 * 
 * GET /order/list
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Lista de pedidos ou mensagem de erro
 */
const listOrders = async (req, res) => {
    try {
        // Parâmetros de paginação (opcionais)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Busca os pedidos com paginação, ordenados por data de criação (mais recente primeiro)
        const orders = await Order.find()
            .sort({ creationDate: -1 })
            .skip(skip)
            .limit(limit);

        // Conta o total de pedidos para informação de paginação
        const total = await Order.countDocuments();

        // Transforma os pedidos para o formato de saída
        const transformedOrders = orders.map(order => transformOrderOutput(order));

        // Retorna a lista de pedidos com informações de paginação
        res.status(200).json({
            success: true,
            data: transformedOrders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao listar os pedidos',
            error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
        });
    }
};

/**
 * Atualiza um pedido existente
 * 
 * PUT /order/:orderId
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Pedido atualizado ou mensagem de erro
 */
const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Valida se o orderId foi fornecido
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'O número do pedido é obrigatório',
                error: 'MISSING_ORDER_ID'
            });
        }

        // Valida se o body foi fornecido
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'O corpo da requisição não pode estar vazio',
                error: 'EMPTY_BODY'
            });
        }

        // Verifica se o pedido existe
        const existingOrder = await Order.findByOrderId(orderId);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: `Pedido ${orderId} não encontrado`,
                error: 'ORDER_NOT_FOUND'
            });
        }

        // Transforma os dados de atualização
        const updateData = transformOrderUpdate(req.body);

        // Atualiza o pedido no banco de dados
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: orderId },
            updateData,
            { 
                new: true, // Retorna o documento atualizado
                runValidators: true // Executa validações do schema
            }
        );

        // Retorna o pedido atualizado
        res.status(200).json({
            success: true,
            message: 'Pedido atualizado com sucesso',
            data: transformOrderOutput(updatedOrder)
        });

    } catch (error) {
        // Trata erros de validação do Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Erro de validação dos dados',
                errors: messages
            });
        }

        console.error('Erro ao atualizar pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao atualizar o pedido',
            error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
        });
    }
};

/**
 * Exclui um pedido
 * 
 * DELETE /order/:orderId
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @returns {Object} Mensagem de sucesso ou erro
 */
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Valida se o orderId foi fornecido
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'O número do pedido é obrigatório',
                error: 'MISSING_ORDER_ID'
            });
        }

        // Tenta excluir o pedido
        const deletedOrder = await Order.findOneAndDelete({ orderId: orderId });

        // Verifica se o pedido foi encontrado e excluído
        if (!deletedOrder) {
            return res.status(404).json({
                success: false,
                message: `Pedido ${orderId} não encontrado`,
                error: 'ORDER_NOT_FOUND'
            });
        }

        // Retorna sucesso com status 200
        res.status(200).json({
            success: true,
            message: `Pedido ${orderId} excluído com sucesso`,
            data: transformOrderOutput(deletedOrder)
        });

    } catch (error) {
        console.error('Erro ao excluir pedido:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao excluir o pedido',
            error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
        });
    }
};

module.exports = {
    createOrder,
    getOrderById,
    listOrders,
    updateOrder,
    deleteOrder
};
