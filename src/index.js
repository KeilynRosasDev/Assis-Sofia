const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const connectDB = require('./config/database');
const User = require('./models/User');

// Import stages
const initialStage = require('./stages/0_initial');
const authStage = require('./stages/1_auth');
const financeStage = require('./stages/2_finance');
const academicStage = require('./stages/3_academic');

// Conectar ao MongoDB
connectDB();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR Code gerado, escaneie com o WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Sofia Bot conectado ao WhatsApp!');
});

client.on('message', async (message) => {
    try {
        const { from, body } = message;
        
        // Ignorar mensagens de grupos e status
        if (message.from.includes('@g.us') || message.from.includes('status')) return;
        
        // Lista completa de saudações (com normalização)
        const normalizeText = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const normalizedMessage = normalizeText(body);
        
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
            'OI', 'OLÁ', 'OLA', 'BOM DIA', 'BOA TARDE', 'BOA NOITE',
            'OLÁ!', 'BOM DIA!', 'BOA TARDE!', 'BOA NOITE!',
            
            // Variações com acentos diferentes
            'oláa', 'oláá', 'olaaa', 'oii', 'oiii', 'oiiii',
            
            // Expressões de início
            'vamos começar', 'começar agora', 'iniciar agora',
            'pode começar', 'começar atendimento', 'iniciar atendimento',
            'preciso de ajuda', 'quero ajuda', 'me ajuda',
            'ajuda por favor', 'ajuda ai', 'ajuda aí'
        ];
        
        // Buscar ou criar usuário
        let user = await User.findOne({ phone: from });
        
        // Se for saudação E o usuário existe com stage >= 2, deletar e recomeçar
        if (greetings.includes(normalizedMessage) && user && user.stage >= 2) {
            console.log(`🔄 Resetando sessão por saudação para: ${from}`);
            await User.deleteOne({ phone: from });
            user = null;
        }
        
        if (!user) {
            user = new User({ 
                phone: from, 
                stage: 0,
                context: {
                    attempts: 0,
                    menuAttempts: 0,
                    financeAttempts: 0,
                    academicAttempts: 0,
                    postMenuAttempts: 0
                }
            });
            await user.save();
        }
        
        // Atualizar última interação
        user.lastInteraction = new Date();
        await user.save();
        
        // Se o usuário estiver em stage > 4, resetar para 0
        if (user.stage > 4) {
            user.stage = 0;
            user.context.attempts = 0;
            user.context.menuAttempts = 0;
            await user.save();
        }
        
        // Roteamento por stage
        const context = { from, message, body, client, user };
        
        switch (user.stage) {
            case 0:
            case 1:
                await initialStage.execute(context);
                break;
            case 2:
                await authStage.execute(context);
                break;
            case 3:
                await financeStage.execute(context);
                break;
            case 4:
                await academicStage.execute(context);
                break;
            default:
                // Reset se stage for inválido
                user.stage = 0;
                user.context.attempts = 0;
                user.context.menuAttempts = 0;
                await user.save();
                await initialStage.execute(context);
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        try {
            await client.sendMessage(message.from, '❌ Ocorreu um erro. Tente novamente.');
        } catch (err) {
            console.error('❌ Erro ao enviar mensagem de erro:', err);
        }
    }
});

client.initialize();