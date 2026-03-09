/**
 * Rotas de Pedidos (Orders)
 * 
 * Define todas as rotas relacionadas às operações de pedidos.
 * Cada rota é conectada ao seu respectivo controller.
 */

const express = require('express');
const router = express.Router();

// Importa o controller de pedidos
const orderController = require('../controllers/orderController');

/**
 * @route   POST /order
 * @desc    Cria um novo pedido
 * @access  Public
 * @body    {
 *   "numeroPedido": "v10089015vdb-01",
 *   "valorTotal": 10000,
 *   "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
 *   "items": [{ "idItem": "2434", "quantidadeItem": 1, "valorItem": 1000 }]
 * }
 */
router.post('/', orderController.createOrder);

/**
 * @route   GET /order/list
 * @desc    Lista todos os pedidos (com paginação opcional)
 * @access  Public
 * @query   page - Número da página (padrão: 1)
 * @query   limit - Itens por página (padrão: 10)
 * 
 * IMPORTANTE: Esta rota deve vir ANTES da rota /:orderId
 * para evitar conflitos de roteamento
 */
router.get('/list', orderController.listOrders);

/**
 * @route   GET /order/:orderId
 * @desc    Obtém um pedido pelo número do pedido
 * @access  Public
 * @param   orderId - Número/ID do pedido
 */
router.get('/:orderId', orderController.getOrderById);

/**
 * @route   PUT /order/:orderId
 * @desc    Atualiza um pedido existente
 * @access  Public
 * @param   orderId - Número/ID do pedido a ser atualizado
 * @body    Campos a serem atualizados (parcial permitido)
 */
router.put('/:orderId', orderController.updateOrder);

/**
 * @route   DELETE /order/:orderId
 * @desc    Exclui um pedido
 * @access  Public
 * @param   orderId - Número/ID do pedido a ser excluído
 */
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;
