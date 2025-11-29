const AcademicData = require('../models/AcademicData');
const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

const academicStage = {
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
            // Menu acadêmico principal
            await client.sendMessage(from, "Certo, como posso te ajudar com:\n\n1. Data Final do semestre\n2. Calendário Acadêmico\n3. Calendário das atividades Online (AOL)");
            user.subStage = 'academic_menu';
            await user.save();
            return;
        }
        
        if (user.subStage === 'academic_menu') {
            if (userMessage === '1') {
                // Data Final do semestre
                await client.sendMessage(from, "Data final do semestre é 15/12/2025.");
                await client.sendMessage(from, "Posso te ajudar com algo mais?\n\n1. Voltar ao menu de Aulas\n2. Menu Principal");
                user.subStage = 'after_date';
                await user.save();
            } else if (userMessage === '2') {
                // Calendário Acadêmico
                await client.sendMessage(from, "Calendário Acadêmico");
                await client.sendMessage(from, "Pronto! Encontrei o Calendário Acadêmico do seu semestre (7º Psicologia Noturno).\nVocê pode baixar o PDF aqui:");
                
                // Enviar arquivo do calendário acadêmico
                const academicData = await AcademicData.findOne({ registration: user.registration });
                if (academicData && academicData.calendarFile) {
                    const filePath = path.join(__dirname, '../../academicos', academicData.calendarFile);
                    await this.sendFileIfExists(from, client, filePath, "Calendário Acadêmico [PDF]");
                } else {
                    // Tentar arquivo padrão
                    const defaultPath = path.join(__dirname, '../../academicos', 'CalendarioAcademico.pdf');
                    await this.sendFileIfExists(from, client, defaultPath, "Calendário Acadêmico [PDF]");
                }
                
                await client.sendMessage(from, "Posso te ajudar com mais alguma coisa?\n\n1. Voltar ao início");
                user.subStage = 'after_calendar';
                await user.save();
            } else if (userMessage === '3') {
                // Calendário AOL
                await client.sendMessage(from, "Pronto! Encontrei o calendário acadêmico\nCalendário das atividades Online (AOL).\nVocê pode baixar o PDF aqui:");
                await client.sendMessage(from, "Anexo: Calendário AOL (PDF)");
                
                // Enviar arquivo do calendário AOL
                const academicData = await AcademicData.findOne({ registration: user.registration });
                if (academicData && academicData.aolFile) {
                    const filePath = path.join(__dirname, '../../academicos', academicData.aolFile);
                    await this.sendFileIfExists(from, client, filePath, "Calendário AOL [PDF]");
                } else {
                    // Tentar arquivo padrão
                    const defaultPath = path.join(__dirname, '../../academicos', 'CalendarioAOL.jpeg');
                    await this.sendFileIfExists(from, client, defaultPath, "Calendário AOL [PDF]");
                }
                
                await client.sendMessage(from, "Posso te ajudar com mais alguma coisa?\n\n1. Voltar ao início");
                user.subStage = 'after_aol';
                await user.save();
            } else {
                // Opção inválida - mostrar menu novamente
                await client.sendMessage(from, "Certo, como posso te ajudar com:\n\n1. Data Final do semestre\n2. Calendário Acadêmico\n3. Calendário das atividades Online (AOL)");
            }
            return;
        }
        
        // Menu após mostrar data final
        if (user.subStage === 'after_date') {
            if (userMessage === '1') {
                // Voltar ao menu de Aulas
                user.subStage = 'academic_menu';
                await user.save();
                await client.sendMessage(from, "Certo, como posso te ajudar com:\n\n1. Data Final do semestre\n2. Calendário Acadêmico\n3. Calendário das atividades Online (AOL)");
            } else if (userMessage === '2') {
                // Menu Principal
                await this.returnToMainMenu(from, client, user);
            } else {
                // Opção inválida
                await client.sendMessage(from, "Posso te ajudar com algo mais?\n\n1. Voltar ao menu de Aulas\n2. Menu Principal");
            }
            return;
        }
        
        // Menu após calendário acadêmico
        if (user.subStage === 'after_calendar') {
            if (userMessage === '1') {
                // Voltar ao início (Menu Principal)
                await this.returnToMainMenu(from, client, user);
            } else {
                // Opção inválida
                await client.sendMessage(from, "Posso te ajudar com mais alguma coisa?\n\n1. Voltar ao início");
            }
            return;
        }
        
        // Menu após calendário AOL
        if (user.subStage === 'after_aol') {
            if (userMessage === '1') {
                // Voltar ao início (Menu Principal)
                await this.returnToMainMenu(from, client, user);
            } else {
                // Opção inválida
                await client.sendMessage(from, "Posso te ajudar com mais alguma coisa?\n\n1. Voltar ao início");
            }
            return;
        }
    }
};

module.exports = academicStage;