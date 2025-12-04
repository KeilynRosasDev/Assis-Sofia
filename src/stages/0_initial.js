const User = require('../models/User');
const Boleto = require('../models/Boleto');
const AcademicData = require('../models/AcademicData');

const initialStage = {
    async isValidRegistration(registration) {
        const validRegistrations = ["09038183", "09042272", "09042346"];
        // Limpar possíveis espaços ou caracteres especiais
        const cleanReg = registration.replace(/\D/g, '');
        return validRegistrations.includes(cleanReg);
    },

    async createUserData(registration) {
        try {
            const existingBoleto = await Boleto.findOne({ registration });
            if (!existingBoleto) {
                await Boleto.create({
                    registration: registration,
                    fileName: `${registration}.pdf`,
                    dueDate: new Date("2023-10-20"),
                    amount: 350.00,
                    paid: false
                });
                console.log(`✅ Boleto criado para: ${registration}`);
            }
            
            const existingAcademic = await AcademicData.findOne({ registration });
            if (!existingAcademic) {
                await AcademicData.create({
                    registration: registration,
                    calendarFile: "CalendarioAcademico.pdf",
                    aolFile: "CalendarioAOL.jpeg",
                    scheduleFile: "HorarioAulas.pdf",
                    provaFile: "Prova.pdf"
                });
                console.log(`✅ Dados acadêmicos criados para: ${registration}`);
            }
        } catch (error) {
            console.error('❌ Erro ao criar dados:', error);
        }
    },

    async execute({ from, message, client, user }) {
        const userMessage = message.body ? message.body.trim() : '';
        
        // Inicializar contexto se não existir
        if (!user.context) {
            user.context = {
                attempts: 0,
                menuAttempts: 0,
                financeAttempts: 0,
                academicAttempts: 0
            };
            await user.save();
        }
        
        // Stage 0: MENSAGEM INICIAL DE BOAS-VINDAS
        if (user.stage === 0) {
            await client.sendMessage(from, "👋 Olá! Eu sou a Sofia, sua assistente virtual acadêmica.\nEstou aqui para ajudar você no que precisar!");
            await client.sendMessage(from, "Para eu poder dar início a seu atendimento, por favor, me informe o número de matrícula.");
            
            user.stage = 1;
            user.context.attempts = 0;
            await user.save();
            return;
        }
        
        // Stage 1: VALIDAÇÃO DA MATRÍCULA (NUNCA PULAR ESTA ETAPA)
        if (user.stage === 1) {
            const registration = userMessage;
            
            // Verificar se é uma mensagem de saudação
            const greetings = ['oi', 'olá', 'ola', 'ei', 'hey', 'hi', 'começar', 'iniciar'];
            if (greetings.includes(userMessage.toLowerCase())) {
                // Reenviar mensagem de boas-vindas e pedir matrícula novamente
                await client.sendMessage(from, "👋 Olá novamente! Para começarmos, preciso do seu número de matrícula.");
                await client.sendMessage(from, "Por favor, digite sua matrícula:");
                return;
            }
            
            // Validar matrícula
            if (await this.isValidRegistration(registration)) {
                user.registration = registration;
                user.stage = 2;
                user.context.attempts = 0;
                await user.save();
                
                await this.createUserData(registration);
                
                // APENAS AQUI mostrar o menu inicial
                await client.sendMessage(from, 
                    "Menu Inicial\n\n" +
                    "Que bom te ver por aqui! Para te ajudar da melhor forma, me diga: O que você gostaria de fazer hoje?\n\n" +
                    "1️⃣ Financeiro💰\n\n" +
                    "2️⃣ Minhas Aulas e Provas📚\n\n" +
                    "3️⃣ Sair: Finalizar e encerrar a sua sessão. 👋\n\n" +
                    "Qual opção te interessa? É só digitar o número! 😉"
                );
            } else {
                user.context.attempts += 1;
                await user.save();
                
                if (user.context.attempts === 1) {
                    await client.sendMessage(from, 
                        "😟 Ops! Matrícula não encontrada.\n" +
                        "Tente novamente e confira se digitou todos os números corretamente."
                    );
                } else if (user.context.attempts === 2) {
                    await client.sendMessage(from, 
                        `😥 Ah, que pena! Não encontrei sua matrícula!\n` +
                        `Puxa, parece que a matrícula ${registration} que você informou não está cadastrada ou foi digitada incorretamente. 😥\n\n` +
                        `🚨 Atenção: Se você tentar digitar a matrícula novamente e ela ainda estiver incorreta, o sistema vai encerrar sua sessão automaticamente por segurança.\n\n` +
                        `Por favor, verifique se você digitou todos os números certinhos agora. Qual número de matrícula você gostaria de tentar novamente? 🤔`
                    );
                } else if (user.context.attempts >= 3) {
                    await client.sendMessage(from, "Sessão encerrada.");
                    await User.deleteOne({ phone: from });
                }
            }
            return;
        }
    }
};

module.exports = initialStage;