const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

const academicStage = {
    async returnToMainMenu(from, client, user) {
        user.stage = 2;
        user.context.academicAttempts = 0;
        user.subStage = '';
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

    async returnToAcademicMenu(from, client, user) {
        user.context.academicAttempts = 0;
        user.subStage = 'academic_menu';
        await user.save();
        await client.sendMessage(from,
            "🗓️ O que você quer saber sobre o suas Aulas e Provas?\n" +
            "Informação é tudo! Para te ajudar a se planejar, o que você procura? 👇\n\n" +
            "1️⃣ Data Final do Semestre🏁\n\n" +
            "2️⃣ Calendário Acadêmico: Baixar o arquivo PDF.\n\n" +
            "3️⃣ Calendário AOL: Visualizar a imagem com as datas de abertura e fechamento das Atividades Online. 📄\n\n" +
            "4️⃣ Voltar para o Menu Principal: Ir direto para a tela de início. 🏡\n\n" +
            "5️⃣ Sair e Encerrar Sessão👋"
        );
    },

    async sendFileIfExists(from, client, filePath, fileName, isImage = false) {
        try {
            if (fs.existsSync(filePath)) {
                const media = MessageMedia.fromFilePath(filePath);
                if (isImage) {
                    await client.sendMessage(from, media, { caption: `📸 ${fileName}` });
                } else {
                    await client.sendMessage(from, media, { caption: `📄 ${fileName}` });
                }
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
        
        if (!user.context.academicAttempts) {
            user.context.academicAttempts = 0;
            await user.save();
        }
        
        if (!user.subStage) {
            await this.returnToAcademicMenu(from, client, user);
            return;
        }
        
        if (user.subStage === 'academic_menu') {
            if (userMessage === '1') {
                user.context.academicAttempts = 0;
                user.subStage = 'after_date';
                await user.save();
                
                await client.sendMessage(from,
                    "🎉 É oficial! A reta final chegou!\n" +
                    "Que ótimo que você está de olho nas datas!\n\n" +
                    "A data final do semestre (o momento de encerramento das suas atividades e avaliações) é no dia 30/12/2025.\n\n" +
                    "Aproveite esse tempo para revisar seus materiais, entregar os últimos trabalhos e brilhar nas provas! 💪 Você está quase lá!\n\n" +
                    "Se precisar de mais alguma informação ou quiser voltar ao menu, é só me chamar! 😉\n\n" +
                    "1- Voltar ao menu de Aulas e provas\n" +
                    "2- Sair"
                );
            } else if (userMessage === '2') {
                user.context.academicAttempts = 0;
                user.subStage = 'after_calendar';
                await user.save();
                
                // MENSAGEM CORRIGIDA: removido nome do curso
                await client.sendMessage(from, "Pronto! Encontrei o Calendário Acadêmico.\nVocê pode baixar o PDF aqui:");
                
                const academicFolder = path.join(__dirname, '../../academicos');
                const files = fs.readdirSync(academicFolder);
                let filePath;
                
                // Procurar por CalendarioAcademico.pdf
                for (const file of files) {
                    if (file.toLowerCase().includes('calendarioacademico') && file.toLowerCase().endsWith('.pdf')) {
                        filePath = path.join(academicFolder, file);
                        break;
                    }
                }
                
                if (!filePath) {
                    // Se não encontrar, usar o caminho padrão
                    filePath = path.join(academicFolder, 'CalendarioAcademico.pdf');
                }
                
                await this.sendFileIfExists(from, client, filePath, "Calendário Acadêmico [PDF]");
                
                await client.sendMessage(from,
                    "Se precisar de mais alguma informação ou quiser voltar ao menu, é só me chamar! 😉\n\n" +
                    "1- Voltar ao menu de Aulas e provas\n" +
                    "2- Sair"
                );
            } else if (userMessage === '3') {
                user.context.academicAttempts = 0;
                user.subStage = 'after_aol';
                await user.save();
                
                // MENSAGEM CORRIGIDA: especificando que é uma imagem
                await client.sendMessage(from, "Pronto! Encontrei o Calendário das Atividades Online (AOL).\nVocê pode visualizar a imagem aqui:");
                
                const academicFolder = path.join(__dirname, '../../academicos');
                const files = fs.readdirSync(academicFolder);
                let filePath;
                
                // Procurar por CalendarioAOL (pode ser jpeg, jpg, png, etc)
                for (const file of files) {
                    const lowerFile = file.toLowerCase();
                    if (lowerFile.includes('calendario') && lowerFile.includes('aol')) {
                        filePath = path.join(academicFolder, file);
                        break;
                    }
                }
                
                if (!filePath) {
                    // Se não encontrar, usar o caminho padrão
                    filePath = path.join(academicFolder, 'CalendarioAOL.jpeg');
                }
                
                // Verificar extensão para saber se é imagem
                const isImage = filePath.toLowerCase().match(/\.(jpeg|jpg|png|gif|bmp)$/);
                await this.sendFileIfExists(from, client, filePath, "Calendário AOL", isImage);
                
                await client.sendMessage(from,
                    "Se precisar de mais alguma informação ou quiser voltar ao menu, é só me chamar! 😉\n\n" +
                    "1- Voltar ao menu de Aulas e provas\n" +
                    "2- Sair"
                );
            } else if (userMessage === '4') {
                await this.returnToMainMenu(from, client, user);
            } else if (userMessage === '5') {
                await client.sendMessage(from, "Sessão encerrada. Até logo! 👋");
                await require('../models/User').deleteOne({ phone: from });
            } else {
                user.context.academicAttempts += 1;
                await user.save();
                
                if (user.context.academicAttempts === 1) {
                    await client.sendMessage(from,
                        "🧐 Opa! Algo não bateu!\n" +
                        "Calma, isso acontece! Parece que o número que você digitou não corresponde a nenhuma opção válida do nosso menu. 😕\n\n" +
                        "Por favor, dê uma olhada nas opções disponíveis novamente e tente digitar apenas o número correspondente à sua escolha."
                    );
                    await this.returnToAcademicMenu(from, client, user);
                } else if (user.context.academicAttempts === 2) {
                    await client.sendMessage(from,
                        "🧐 Opa! Algo não bateu!\n" +
                        "Calma, isso acontece! Parece que o número que você digitou não corresponde a nenhuma opção válida do nosso menu. 😕\n\n" +
                        "⚠️ Importante: Se você digitar uma opção inválida novamente, por segurança, encerrarei sua sessão de forma automática para recomeçarmos do zero, ok?\n\n" +
                        "Por favor, dê uma olhada nas opções disponíveis novamente e tente digitar apenas o número correspondente à sua escolha."
                    );
                    await this.returnToAcademicMenu(from, client, user);
                } else if (user.context.academicAttempts >= 3) {
                    await client.sendMessage(from, "Sessão encerrada.");
                    await require('../models/User').deleteOne({ phone: from });
                }
            }
            return;
        }
        
        // Tratamento após mostrar data
        if (user.subStage === 'after_date') {
            if (userMessage === '1') {
                await this.returnToAcademicMenu(from, client, user);
            } else if (userMessage === '2') {
                await client.sendMessage(from, "Sessão encerrada. Até logo! 👋");
                await require('../models/User').deleteOne({ phone: from });
            }
            return;
        }
        
        // Tratamento após mostrar calendário
        if (user.subStage === 'after_calendar') {
            if (userMessage === '1') {
                await this.returnToAcademicMenu(from, client, user);
            } else if (userMessage === '2') {
                await client.sendMessage(from, "Sessão encerrada. Até logo! 👋");
                await require('../models/User').deleteOne({ phone: from });
            }
            return;
        }
        
        // Tratamento após mostrar AOL
        if (user.subStage === 'after_aol') {
            if (userMessage === '1') {
                await this.returnToAcademicMenu(from, client, user);
            } else if (userMessage === '2') {
                await client.sendMessage(from, "Sessão encerrada. Até logo! 👋");
                await require('../models/User').deleteOne({ phone: from });
            }
            return;
        }
    }
};

module.exports = academicStage;