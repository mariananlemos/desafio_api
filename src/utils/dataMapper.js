/**
 * Utilitário de Transformação de Dados (Data Mapper)
 * 
 * Este módulo é responsável por realizar a transformação dos dados
 * recebidos pela API para o formato esperado pelo banco de dados.
 * 
 * Mapeamento de campos:
 * - numeroPedido → orderId
 * - valorTotal → value
 * - dataCriacao → creationDate
 * - items[].idItem → items[].productId
 * - items[].quantidadeItem → items[].quantity
 * - items[].valorItem → items[].price
 */

/**
 * Transforma os dados do pedido do formato de entrada para o formato do banco
 * 
 * @param {Object} inputData - Dados recebidos na requisição (formato português)
 * @returns {Object} Dados transformados para o formato do banco (formato inglês)
 * @throws {Error} Caso os dados de entrada sejam inválidos
 */
const transformOrderInput = (inputData) => {
    // Validação básica dos dados de entrada
    if (!inputData) {
        throw new Error('Dados do pedido não fornecidos');
    }

    // Transforma os items do pedido
    const transformedItems = transformItems(inputData.items);

    // Retorna o objeto transformado
    return {
        orderId: inputData.numeroPedido,
        value: inputData.valorTotal,
        creationDate: parseCreationDate(inputData.dataCriacao),
        items: transformedItems
    };
};

/**
 * Transforma o array de items do formato de entrada para o formato do banco
 * 
 * @param {Array} items - Array de items no formato de entrada
 * @returns {Array} Array de items transformados
 * @throws {Error} Caso os items sejam inválidos
 */
const transformItems = (items) => {
    // Validação do array de items
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('O pedido deve conter pelo menos um item');
    }

    // Mapeia cada item para o novo formato
    return items.map((item, index) => {
        // Validação de campos obrigatórios do item
        if (!item.idItem) {
            throw new Error(`Item ${index + 1}: idItem é obrigatório`);
        }
        if (item.quantidadeItem === undefined || item.quantidadeItem === null) {
            throw new Error(`Item ${index + 1}: quantidadeItem é obrigatório`);
        }
        if (item.valorItem === undefined || item.valorItem === null) {
            throw new Error(`Item ${index + 1}: valorItem é obrigatório`);
        }

        return {
            productId: parseInt(item.idItem, 10),
            quantity: item.quantidadeItem,
            price: item.valorItem
        };
    });
};

/**
 * Faz o parse da data de criação para o formato ISO
 * 
 * @param {string} dateString - String da data no formato de entrada
 * @returns {Date} Objeto Date parseado
 */
const parseCreationDate = (dateString) => {
    if (!dateString) {
        return new Date(); // Retorna data atual se não fornecida
    }

    // Converte a string para Date
    const date = new Date(dateString);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
        throw new Error('Data de criação inválida');
    }

    return date;
};

/**
 * Transforma os dados do pedido do formato do banco para o formato de saída
 * (Inverso da transformação - usado para algumas respostas específicas)
 * 
 * @param {Object} orderData - Dados do pedido no formato do banco
 * @returns {Object} Dados no formato de saída padronizado
 */
const transformOrderOutput = (orderData) => {
    if (!orderData) {
        return null;
    }

    return {
        orderId: orderData.orderId,
        value: orderData.value,
        creationDate: orderData.creationDate ? orderData.creationDate.toISOString() : null,
        items: orderData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        }))
    };
};

/**
 * Transforma dados de atualização do pedido
 * Permite atualização parcial dos campos
 * 
 * @param {Object} updateData - Dados de atualização recebidos
 * @returns {Object} Dados transformados para atualização
 */
const transformOrderUpdate = (updateData) => {
    const transformed = {};

    // Transforma apenas os campos fornecidos
    if (updateData.numeroPedido !== undefined) {
        transformed.orderId = updateData.numeroPedido;
    }
    if (updateData.valorTotal !== undefined) {
        transformed.value = updateData.valorTotal;
    }
    if (updateData.dataCriacao !== undefined) {
        transformed.creationDate = parseCreationDate(updateData.dataCriacao);
    }
    if (updateData.items !== undefined) {
        transformed.items = transformItems(updateData.items);
    }

    return transformed;
};

module.exports = {
    transformOrderInput,
    transformOrderOutput,
    transformOrderUpdate,
    transformItems,
    parseCreationDate
};
