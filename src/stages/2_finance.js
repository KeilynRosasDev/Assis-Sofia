const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

const financeStage = {
    async returnToMainMenu(from, client, user) {
        user.stage = 2;
        user.subStage = '';
        user.context.financeAttempts = 0;
        await user.save();
        await client.sendMessage(from,
            "Menu Inicial\n\n" +
            "Que bom te ver por aqui! Para te ajudar da melhor forma, me diga: O que você gostaria de fazer hoje?\n\n" +
            "1️⃣ Financeiro💰\n\n" +
            "2️⃣ Minhas Aulas e Provas📚\n\n" +
            "3️⃣ Sair: Finalizar e encerrar a sua sessão. 👋\n\n" +
            "Qual opção te interessa? É só digitar o número! 😉"
        );
    },

    async sendBoleto(from, client, user) {
        try {
            // Verificar se tem matrícula
            if (!user.registration) {
                await client.sendMessage(from, "❌ Não foi possível encontrar sua matrícula. Por favor, comece novamente.");
                return;
            }

            // Construir caminho do arquivo
            const fileName = `${user.registration}.pdf`;
            const filePath = path.join(__dirname, '../../boletos', fileName);
            
            console.log(`📁 Procurando boleto: ${filePath}`);
            
            // Verificar se o arquivo existe
            if (fs.existsSync(filePath)) {
                console.log(`✅ Arquivo encontrado: ${fileName}`);
                
                // Primeiro enviar mensagem de confirmação
                await client.sendMessage(from, `📄 Pronto! Encontrei seu boleto (matrícula: ${user.registration}).`);
                await client.sendMessage(from, "Baixando arquivo...");
                
                // Enviar o arquivo
                try {
                    const media = MessageMedia.fromFilePath(filePath);
                    await client.sendMessage(from, media, { caption: `📄 Boleto - ${user.registration}` });
                    console.log(`✅ Boleto enviado para: ${user.registration}`);
                } catch (fileError) {
                    console.error('❌ Erro ao criar Media:', fileError);
                    await client.sendMessage(from, "❌ Erro ao preparar o arquivo do boleto.");
                }
            } else {
                console.log(`❌ Arquivo não encontrado: ${fileName}`);
                console.log(`📁 Conteúdo da pasta boletos:`, fs.readdirSync(path.join(__dirname, '../../boletos')));
                await client.sendMessage(from, `❌ Não encontrei o boleto para a matrícula ${user.registration}.`);
                await client.sendMessage(from, "Matrículas disponíveis: 09038183, 09042272, 09042346");
            }
        } catch (error) {
            console.error('❌ Erro ao enviar boleto:', error);
            await client.sendMessage(from, "❌ Ocorreu um erro ao buscar seu boleto. Tente novamente.");
        }
    },

    async execute({ from, message, client, user }) {
        const userMessage = message.body ? message.body.trim() : '';
        
        // Inicializar tentativas se não existir
        if (!user.context.financeAttempts) {
            user.context.financeAttempts = 0;
            await user.save();
        }
        
        console.log(`📊 Finance Stage - Stage: ${user.stage}, SubStage: ${user.subStage}, Matrícula: ${user.registration}`);
        
        // Se não tem subStage, mostrar menu financeiro
        if (!user.subStage || user.subStage === '') {
            await client.sendMessage(from,
                "💼 Certo! Vamos cuidar das suas Finanças!\n" +
                "É importante manter tudo em dia, e eu estou aqui para te ajudar com isso! 😊\n\n" +
                "1️⃣ Meu Boleto🧾\n\n" +
                "2️⃣ Voltar ao Menu Principal🏡\n\n" +
                "3️⃣ Sair: Encerrar sua sessão👋\n\n" +
                "Qual a sua escolha? Digite o número! 👇"
            );
            user.subStage = 'finance_menu';
            await user.save();
            return;
        }
        
        // Menu financeiro principal
        if (user.subStage === 'finance_menu') {
            if (userMessage === '1') {
                // Opção 1: Meu Boleto
                user.context.financeAttempts = 0;
                await user.save();
                
                // ENVIAR O BOLETO AGORA
                await this.sendBoleto(from, client, user);
                
                // Após enviar o boleto, mostrar menu financeiro novamente
                await client.sendMessage(from,
                    "\n💼 Posso te ajudar com mais alguma coisa?\n\n" +
                    "1️⃣ Meu Boleto🧾\n\n" +
                    "2️⃣ Voltar ao Menu Principal🏡\n\n" +
                    "3️⃣ Sair: Encerrar sua sessão👋\n\n" +
                    "Digite o número da opção desejada: 👇"
                );
                // Manter no mesmo subStage para continuar recebendo opções
                
            } else if (userMessage === '2') {
                // Opção 2: Voltar ao Menu Principal
                await this.returnToMainMenu(from, client, user);
            } else if (userMessage === '3') {
                // Opção 3: Sair
                await client.sendMessage(from, "Sessão encerrada. Até logo! 👋");
                await require('../models/User').deleteOne({ phone: from });
            } else {
                // Opção inválida
                user.context.financeAttempts += 1;
                await user.save();
                
                if (user.context.financeAttempts === 1) {
                    await client.sendMessage(from,
                        "🧐 Opa! Algo não bateu!\n" +
                        "Calma, isso acontece! Parece que o número que você digitou não corresponde a nenhuma opção válida do nosso menu. 😕\n\n" +
                        "Por favor, escolha uma das opções abaixo:\n\n" +
                        "1️⃣ Meu Boleto🧾\n\n" +
                        "2️⃣ Voltar ao Menu Principal🏡\n\n" +
                        "3️⃣ Sair: Encerrar sua sessão👋"
                    );
                } else if (user.context.financeAttempts === 2) {
                    await client.sendMessage(from,
                        "🧐 Opa! Algo não bateu!\n" +
                        "⚠️ Importante: Se você digitar uma opção inválida novamente, por segurança, encerrarei sua sessão de forma automática para recomeçarmos do zero, ok?\n\n" +
                        "Por favor, escolha uma opção válida:\n\n" +
                        "1️⃣ Meu Boleto🧾\n\n" +
                        "2️⃣ Voltar ao Menu Principal🏡\n\n" +
                        "3️⃣ Sair: Encerrar sua sessão👋"
                    );
                } else if (user.context.financeAttempts >= 3) {
                    await client.sendMessage(from, "Sessão encerrada.");
                    await require('../models/User').deleteOne({ phone: from });
                }
            }
            return;
        }
    }
};

module.exports = financeStage;