const User = require('../models/User');
const Boleto = require('../models/Boleto');
const AcademicData = require('../models/AcademicData');

const initialStage = {
    async isValidRegistration(registration) {
        const validRegistrations = ["09038183", "09042272", "09042346"];
        return validRegistrations.includes(registration);
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

    async showMainMenu(from, client) {
        await client.sendMessage(from, "Certo, vamos falar sobre sua matrícula. Posso te ajudar com:\n\n1. Financeiro\n2. Minhas Aulas e Provas");
    },

    async execute({ from, message, client, user }) {
        const userMessage = message.body ? message.body.trim() : '';
        
        if (user.stage === 0) {
            await client.sendMessage(from, "Oi para eu poder buscar as informações academicas para você, por favor, me informe o número de matrícula.");
            user.stage = 1;
            user.subStage = 'waiting_registration';
            await user.save();
            return;
        }
        
        if (user.stage === 1 && user.subStage === 'waiting_registration') {
            const registration = userMessage;
            
            if (await this.isValidRegistration(registration)) {
                user.registration = registration;
                user.stage = 2;
                user.subStage = '';
                await user.save();
                await this.createUserData(registration);
                await this.showMainMenu(from, client);
            } else {
                await client.sendMessage(from, "Hum, não consegui encontrar essa matrícula. Por favor, verifique o número que me informou, pode ter uma pequena instabilidade no sistema da Instituição ou talvez o erro seja de digitação. Tente de novo. Pode digitar sua matrícula novamente, por favor?");
                user.subStage = 'second_attempt';
                await user.save();
            }
            return;
        }
        
        if (user.stage === 1 && user.subStage === 'second_attempt') {
            const registration = userMessage;
            
            if (await this.isValidRegistration(registration)) {
                user.registration = registration;
                user.stage = 2;
                user.subStage = '';
                await user.save();
                await this.createUserData(registration);
                await this.showMainMenu(from, client);
            } else {
                await client.sendMessage(from, "Que pena que sua matrícula realmente não está sendo usada. Não se preocupe! Isso pode ser uma instabilidade no sistema da Instituição ou apenas erro de digitação. Você irá transferir agora mesmo para um atendente humano que irá verificar o seu status, tudo bem por você?");
                await client.sendMessage(from, "Transferência humana.");
                user.stage = 0;
                user.subStage = '';
                await user.save();
            }
            return;
        }
    }
};

module.exports = initialStage;