/**
 * Model do Pedido (Order)
 * 
 * Define a estrutura de dados para os pedidos no banco de dados MongoDB.
 * Os dados recebidos pela API são transformados para este formato antes de serem salvos.
 */

const mongoose = require('mongoose');
const itemSchema = require('./Item');

/**
 * Schema do Pedido
 * 
 * Campos (após transformação/mapping):
 * - orderId: Identificador único do pedido (string)
 * - value: Valor total do pedido
 * - creationDate: Data de criação do pedido
 * - items: Array de itens do pedido
 */
const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: [true, 'O número do pedido (orderId) é obrigatório'],
        unique: true,
        trim: true,
        index: true // Índice para buscas mais rápidas
    },
    value: {
        type: Number,
        required: [true, 'O valor total (value) é obrigatório'],
        min: [0, 'O valor total não pode ser negativo']
    },
    creationDate: {
        type: Date,
        required: [true, 'A data de criação (creationDate) é obrigatória'],
        default: Date.now
    },
    items: {
        type: [itemSchema],
        required: [true, 'O pedido deve conter pelo menos um item'],
        validate: {
            validator: function(items) {
                return items && items.length > 0;
            },
            message: 'O pedido deve conter pelo menos um item'
        }
    }
}, {
    // Adiciona timestamps automáticos (createdAt, updatedAt)
    timestamps: true,
    // Configurações de serialização JSON
    toJSON: {
        // Remove campos internos do Mongoose na serialização
        transform: function(doc, ret) {
            delete ret._id;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
            return ret;
        }
    }
});

/**
 * Índice composto para otimizar consultas frequentes
 */
orderSchema.index({ creationDate: -1 });

/**
 * Método estático para buscar pedido por orderId
 * 
 * @param {string} orderId - Número/ID do pedido
 * @returns {Promise<Order>} Pedido encontrado ou null
 */
orderSchema.statics.findByOrderId = function(orderId) {
    return this.findOne({ orderId: orderId });
};

// Cria e exporta o modelo Order
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
