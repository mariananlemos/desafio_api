/**
 * Model do Item do Pedido
 * 
 * Define a estrutura de cada item dentro de um pedido.
 * Este schema é utilizado como subdocumento no modelo Order.
 */

const mongoose = require('mongoose');

/**
 * Schema do Item
 * 
 * Campos (após transformação/mapping):
 * - productId: Identificador do produto (número)
 * - quantity: Quantidade do item no pedido
 * - price: Preço unitário do item
 */
const itemSchema = new mongoose.Schema({
    productId: {
        type: Number,
        required: [true, 'O ID do produto (productId) é obrigatório'],
        min: [1, 'O ID do produto deve ser maior que zero']
    },
    quantity: {
        type: Number,
        required: [true, 'A quantidade (quantity) é obrigatória'],
        min: [1, 'A quantidade deve ser no mínimo 1']
    },
    price: {
        type: Number,
        required: [true, 'O preço (price) é obrigatório'],
        min: [0, 'O preço não pode ser negativo']
    }
}, {
    // Desabilita o _id para subdocumentos de items
    _id: false
});

module.exports = itemSchema;
