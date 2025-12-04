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

    // Função para normalizar texto (remover acentos, converter para minúsculas)
    normalizeText(text) {
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    },

    async execute({ from, message, client, user }) {
        const userMessage = message.body ? message.body.trim() : '';
        const normalizedMessage = this.normalizeText(userMessage);
        
        // Inicializar contexto se não existir
        if (!user.context) {
            user.context = {
                attempts: 0,
                menuAttempts: 0,
                financeAttempts: 0,
                academicAttempts: 0,
                postMenuAttempts: 0
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
            // Lista completa de saudações para reconhecer
            const greetings = [
                // Saudações básicas
                'oi', 'ola', 'olá', 'ei', 'hey', 'hi', 'hello', 'alo', 'alô',
                'começar', 'iniciar', 'start', 'help', 'ajuda',
                
                // Bom dia em várias variações
                'bom dia', 'bomdia', 'dia', 'bom-dia',
                'bom dia!', 'bom dia.', 'bom dia?',
                'bom diaa', 'bom diaaa', 'bom diaaaa',
                'bom dia!', 'bom dia!!', 'bom dia!!!',
                
                // Boa tarde em várias variações
                'boa tarde', 'boatarde', 'tarde', 'boa-tarde',
                'boa tarde!', 'boa tarde.', 'boa tarde?',
                'boa tardee', 'boa tardeee', 'boa tardeeee',
                'boa tarde!', 'boa tarde!!', 'boa tarde!!!',
                
                // Boa noite em várias variações
                'boa noite', 'boanoite', 'noite', 'boa-noite',
                'boa noite!', 'boa noite.', 'boa noite?',
                'boa noitee', 'boa noiteee', 'boa noiteeee',
                'boa noite!', 'boa noite!!', 'boa noite!!!',
                
                // Saudações formais
                'saudações', 'saudacoes', 'cumprimentos',
                'saudação', 'saudacao', 'cumprimento',
                
                // Variações em maiúsculas (normalizadas para minúsculas)
                'oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite',
                'olá!', 'bom dia!', 'boa tarde!', 'boa noite!',
                
                // Variações com acentos diferentes
                'oláa', 'oláá', 'olaaa', 'oii', 'oiii', 'oiiii',
                
                // Expressões de início
                'vamos começar', 'começar agora', 'iniciar agora',
                'pode começar', 'começar atendimento', 'iniciar atendimento',
                'preciso de ajuda', 'quero ajuda', 'me ajuda',
                'ajuda por favor', 'ajuda ai', 'ajuda aí'
            ];
            
            // Verificar se é uma mensagem de saudação
            if (greetings.includes(normalizedMessage)) {
                // Se for saudação, mostrar mensagem de boas-vindas apropriada
                if (normalizedMessage.includes('bom dia')) {
                    await client.sendMessage(from, "🌅 Bom dia! Eu sou a Sofia, sua assistente virtual acadêmica.");
                } else if (normalizedMessage.includes('boa tarde')) {
                    await client.sendMessage(from, "🌇 Boa tarde! Eu sou a Sofia, sua assistente virtual acadêmica.");
                } else if (normalizedMessage.includes('boa noite')) {
                    await client.sendMessage(from, "🌃 Boa noite! Eu sou a Sofia, sua assistente virtual acadêmica.");
                } else {
                    await client.sendMessage(from, "👋 Olá! Eu sou a Sofia, sua assistente virtual acadêmica.");
                }
                
                await client.sendMessage(from, "Estou aqui para ajudar você no que precisar!");
                await client.sendMessage(from, "Para começarmos, preciso do seu número de matrícula.\n\nPor favor, digite sua matrícula:");
                return;
            }
            
            // Validar matrícula
            if (await this.isValidRegistration(userMessage)) {
                user.registration = userMessage;
                user.stage = 2;
                user.context.attempts = 0;
                user.context.menuAttempts = 0;
                await user.save();
                
                await this.createUserData(userMessage);
                
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
                        `Puxa, parece que a matrícula ${userMessage} que você informou não está cadastrada ou foi digitada incorretamente. 😥\n\n` +
                        `🚨 Atenção: Se você tentar digitar a matrícula novamente e ela ainda estiver incorreta, o sistema vai encerrar sua sessão automaticamente por segurança.\n\n` +
                        `Por favor, verifique se você digitou todos os números certinhos agora. Qual número de matrícula você gostiar de tentar novamente? 🤔`
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