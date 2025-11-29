const financeStage = require('./2_finance');
const academicStage = require('./3_academic');

const authStage = {
    async showMainMenu(from, client) {
        await client.sendMessage(from, "Certo, vamos falar sobre sua matrícula. Posso te ajudar com:\n\n1. Financeiro\n2. Minhas Aulas e Provas");
    },

    async execute({ from, message, client, user }) {
        const userMessage = message.body ? message.body.trim() : '';
        
        if (userMessage === '1') {
            user.stage = 3;
            await user.save();
            return financeStage.execute({ from, message, client, user });
        } else if (userMessage === '2') {
            user.stage = 4;
            user.subStage = ''; // Reset para começar no novo menu
            await user.save();
            return academicStage.execute({ from, message, client, user });
        } else {
            await this.showMainMenu(from, client);
            return;
        }
    }
};

module.exports = authStage;