"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listarEnviosEmailController = exports.enviarEmailController = void 0;
const empresa_1 = __importDefault(require("../models/empresa"));
const perfil_1 = __importDefault(require("../models/perfil"));
const envioEmail_1 = __importDefault(require("../models/envioEmail"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.user_mail,
        pass: process.env.user_pass,
    },
});
const enviarEmail = (destinatarios, assunto, corpo, perfilId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let perfilConteudo = '';
        if (perfilId) {
            const perfil = yield perfil_1.default.findByPk(perfilId);
            if (perfil) {
                perfilConteudo = perfil.ds_conteudo;
            }
        }
        const substituirMacros = (texto, empresa) => {
            var _a;
            const dataCriacao = empresa.dt_criacao ? new Date(empresa.dt_criacao) : new Date();
            return texto
                .replace(/@nome@/g, empresa.ds_nome)
                .replace(/@status@/g, empresa.ie_status || '')
                .replace(/@cnpj@/g, empresa.cd_cnpj || '')
                .replace(/@cpf@/g, empresa.nr_cpf || '')
                .replace(/@email@/g, empresa.ds_email || '')
                .replace(/@dtcadastro@/g, dataCriacao.toLocaleDateString())
                .replace(/@tel1@/g, empresa.nr_telefone_1 || '')
                .replace(/@processo@/g, ((_a = empresa.nr_processo) === null || _a === void 0 ? void 0 : _a.toString()) || '')
                .replace(/@tel2@/g, empresa.nr_telefone_2 || '');
        };
        const empresas = yield empresa_1.default.findAll({
            where: {
                ds_email: destinatarios,
            },
        });
        const empresasPorEmail = destinatarios.reduce((acc, email) => {
            acc[email] = empresas.filter(e => e.ds_email === email);
            return acc;
        }, {});
        const promises = destinatarios.map((destinatario) => __awaiter(void 0, void 0, void 0, function* () {
            const empresasParaEmail = empresasPorEmail[destinatario];
            if (!empresasParaEmail || empresasParaEmail.length === 0) {
                console.warn(`Nenhuma empresa encontrada para o e-mail: ${destinatario}`);
                return;
            }
            const corpoFinal = empresasParaEmail
                .map((empresa) => substituirMacros(corpo, empresa))
                .join('<br><br>'); // Junta os corpos com uma separação entre eles
            try {
                const info = yield transporter.sendMail({
                    from: process.env.user_mail,
                    to: destinatario,
                    subject: assunto,
                    html: corpoFinal,
                    headers: {
                        'X-Mailer': 'Nodemailer',
                        'List-Unsubscribe': '<mailto:unsubscribe@dominio.com>',
                    },
                });
                console.log(`Email enviado para: ${destinatario}, ID da mensagem: ${info.messageId}`);
                const envioPromises = empresasParaEmail.map((empresa) => __awaiter(void 0, void 0, void 0, function* () {
                    const novaDataVencimento = new Date(empresa.dt_vencimento || Date.now());
                    const repeticao = empresa.nr_repeticao || 1;
                    novaDataVencimento.setMonth(novaDataVencimento.getMonth() + repeticao);
                    yield empresa.update({ dt_vencimento: novaDataVencimento });
                    yield envioEmail_1.default.create({
                        empresa_id: empresa.id,
                        perfil_id: perfilId,
                        ds_assunto: assunto,
                        ds_conteudo: substituirMacros(corpo, empresa),
                        dt_envio: new Date(),
                    });
                }));
                yield Promise.all(envioPromises);
            }
            catch (error) {
                console.error(`Erro ao enviar e-mail para ${destinatario}:`, error);
            }
        }));
        yield Promise.all(promises);
        console.log('E-mails enviados e dados salvos com sucesso.');
    }
    catch (error) {
        console.error('Erro ao enviar e-mails:', error);
    }
});
const enviarEmailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { destinatarios, assunto, corpo, perfilId } = req.body;
    try {
        yield enviarEmail(destinatarios, assunto, corpo, perfilId);
        res.status(200).json({ message: 'E-mails enviados com sucesso.' });
    }
    catch (error) {
        console.error('Erro ao enviar e-mails:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});
exports.enviarEmailController = enviarEmailController;
const listarEnviosEmailController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const envios = yield envioEmail_1.default.findAll({
            order: [['dt_envio', 'DESC']],
        });
        res.status(200).json(envios);
    }
    catch (error) {
        console.error('Erro ao listar envios de e-mail:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});
exports.listarEnviosEmailController = listarEnviosEmailController;
