const Boleto = require('../models/Boleto');
const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

const financeStage = {
    async returnToMainMenu(from, client, user) {
        user.stage = 2;
        user.subStage = '';
        await user.save();
        await client.sendMessage(from, "Certo, vamos falar sobre sua matrícula. Posso te ajudar com:\n\n1. Financeiro\n2. Minhas Aulas e Provas");
    },

    async sendFileIfExists(from, client, filePath, fileName) {
        try {
            if (fs.existsSync(filePath)) {
                const media = MessageMedia.fromFilePath(filePath);
                await client.sendMessage(from, media, { caption: fileName });
                return true;
            } else {
                await client.sendMessage(from, `❌ Arquivo ${fileName} não encontrado.`);
                console.log(`Arquivo não encontrado: ${filePath}`);
                return false;
            }
        } catch (error) {
            console.error('Erro ao enviar arquivo:', error);
            await client.sendMessage(from, `❌ Erro ao enviar ${fileName}.`);
            return false;
        }
    },

    async execute({ from, message, client, user }) {
        const userMessage = message.body ? message.body.trim() : '';
        
        if (!user.subStage) {
            // Menu financeiro principal
            await client.sendMessage(from, "Certo, vamos falar sobre suas finanças. Posso te ajudar com:\n\n1. Boleto atual");
            user.subStage = 'finance_menu';
            await user.save();
            return;
        }
        
        if (user.subStage === 'finance_menu') {
            if (userMessage === '1') {
                // Boleto atual
                await client.sendMessage(from, "Boleto atual");
                
                // Buscar boleto mais recente da matrícula
                const latestBoleto = await Boleto.findOne({ 
                    registration: user.registration 
                }).sort({ dueDate: -1 }); // Ordena por data decrescente (mais recente primeiro)

                if (latestBoleto) {
                    const dueDate = new Date(latestBoleto.dueDate).toLocaleDateString('pt-BR');
                    const amount = latestBoleto.amount.toFixed(2).replace('.', ',');
                    
                    await client.sendMessage(from, `Pronto! Encontrei seu boleto de novembro (vencimento ${dueDate}), no valor de R$ ${amount}.`);
                    await client.sendMessage(from, "📄 Baixar Boleto (PDF)");
                    
                    // Enviar arquivo do boleto
                    const filePath = path.join(__dirname, '../../boletos', latestBoleto.fileName);
                    await this.sendFileIfExists(from, client, filePath, `Boleto - ${latestBoleto.fileName}`);
                    
                } else {
                    await client.sendMessage(from, "❌ Não foi encontrado nenhum boleto para sua matrícula.");
                }
                
                await client.sendMessage(from, "Posso te ajudar com mais alguma coisa no Financeiro?\n\n1. Voltar ao início.");
                user.subStage = 'after_boleto';
                await user.save();
            } else {
                // Opção inválida
                await client.sendMessage(from, "Certo, vamos falar sobre suas finanças. Posso te ajudar com:\n\n1. Boleto atual");
            }
            return;
        }
        
        // Menu após mostrar boleto
        if (user.subStage === 'after_boleto') {
            if (userMessage === '1') {
                // Voltar ao início (Menu Principal)
                await this.returnToMainMenu(from, client, user);
            } else {
                // Opção inválida
                await client.sendMessage(from, "Posso te ajudar com mais alguma coisa no Financeiro?\n\n1. Voltar ao início.");
            }
            return;
        }
    }
};

module.exports = financeStage;