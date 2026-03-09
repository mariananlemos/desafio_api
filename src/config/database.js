/**
 * Configuração da conexão com o banco de dados MongoDB
 * 
 * Este módulo é responsável por estabelecer e gerenciar a conexão
 * com o banco de dados MongoDB usando Mongoose.
 */

const mongoose = require('mongoose');

/**
 * Função para conectar ao banco de dados MongoDB
 * 
 * @returns {Promise} Promise que resolve quando a conexão é estabelecida
 * @throws {Error} Caso ocorra erro na conexão
 */
const connectDatabase = async () => {
    try {
        // Obtém a URI do MongoDB das variáveis de ambiente
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/orders_db';
        
        // Configurações de conexão do Mongoose
        const options = {
            // Usar o novo parser de URL do MongoDB
            useNewUrlParser: true,
            // Usar o novo mecanismo de monitoramento do servidor
            useUnifiedTopology: true,
        };

        // Estabelece a conexão com o MongoDB
        await mongoose.connect(mongoURI);

        console.log('✅ Conexão com o MongoDB estabelecida com sucesso!');
        console.log(`📦 Banco de dados: ${mongoose.connection.name}`);

        // Eventos de conexão para monitoramento
        mongoose.connection.on('error', (error) => {
            console.error('❌ Erro na conexão com o MongoDB:', error.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ Conexão com o MongoDB foi encerrada.');
        });

        // Tratamento para encerramento gracioso da aplicação
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 Conexão com o MongoDB encerrada devido ao término da aplicação.');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error.message);
        // Encerra a aplicação em caso de falha na conexão
        process.exit(1);
    }
};

module.exports = connectDatabase;
