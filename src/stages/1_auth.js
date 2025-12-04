const financeStage = require('./2_finance');
const academicStage = require('./3_academic');
const User = require('../models/User');

const authStage = {
    async execute({ from, message, client, user }) {
        const userMessage = message.body ? message.body.trim() : '';
        
        // Se não tem matrícula, voltar para o início
        if (!user.registration) {
            user.stage = 0;
            await user.save();
            return require('./0_initial').execute({ from, message, client, user });
        }
        
        // Inicializar tentativas do menu
        if (typeof user.context.menuAttempts === 'undefined') {
            user.context.menuAttempts = 0;
            await user.save();
        }
        
        console.log(`📊 Auth Stage - Opção: ${userMessage}, Tentativas: ${user.context.menuAttempts}`);
        
        if (userMessage === '1') {
            user.context.menuAttempts = 0;
            user.stage = 3;
            user.subStage = ''; // IMPORTANTE: Resetar subStage
            await user.save();
            
            // AGORA O menu financeiro será mostrado pelo financeStage
            // Não enviar mensagem aqui, deixe o financeStage fazer isso
            return financeStage.execute({ from, message, client, user });
            
        } else if (userMessage === '2') {
            user.context.menuAttempts = 0;
            user.stage = 4;
            user.subStage = '';
            await user.save();
            
            return academicStage.execute({ from, message, client, user });
            
        } else if (userMessage === '3') {
            await client.sendMessage(from, "Sessão encerrada. Até logo! 👋");
            await User.deleteOne({ phone: from });
        } else {
            user.context.menuAttempts += 1;
            await user.save();
            
            if (user.context.menuAttempts === 1) {
                await client.sendMessage(from,
                    "🧐 Opa! Algo não bateu!\n" +
                    "Calma, isso acontece! Parece que o número que você digitou não corresponde a nenhuma opção válida do nosso menu. 😕\n\n" +
                    "Por favor, escolha uma opção válida:\n\n" +
                    "1️⃣ Financeiro💰\n\n" +
                    "2️⃣ Minhas Aulas e Provas📚\n\n" +
                    "3️⃣ Sair: Finalizar e encerrar a sua sessão. 👋"
                );
            } else if (user.context.menuAttempts === 2) {
                await client.sendMessage(from,
                    "🧐 Opa! Algo não bateu!\n" +
                    "⚠️ Importante: Se você digitar uma opção inválida novamente, por segurança, encerrarei sua sessão de forma automática para recomeçarmos do zero, ok?\n\n" +
                    "Por favor, escolha uma opção válida:\n\n" +
                    "1️⃣ Financeiro💰\n\n" +
                    "2️⃣ Minhas Aulas e Provas📚\n\n" +
                    "3️⃣ Sair: Finalizar e encerrar a sua sessão. 👋"
                );
            } else if (user.context.menuAttempts >= 3) {
                await client.sendMessage(from, "Sessão encerrada.");
                await User.deleteOne({ phone: from });
            }
        }
    }
};

module.exports = authStage;