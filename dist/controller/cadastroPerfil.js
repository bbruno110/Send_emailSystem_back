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
exports.updatePerfil = exports.createPerfil = exports.getAllPerfis = void 0;
const perfil_1 = __importDefault(require("../models/perfil"));
const getAllPerfis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const perfis = yield perfil_1.default.findAll({
            attributes: {
                exclude: ['dt_criacao', 'dt_atualizacao'], // Exclui as datas da resposta
            },
        });
        res.status(200).json(perfis);
    }
    catch (error) {
        console.error('Erro ao listar perfis:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.getAllPerfis = getAllPerfis;
const createPerfil = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nm_titulo, ds_conteudo } = req.body;
    // Verifica se o título e o conteúdo foram fornecidos
    if (!nm_titulo || !ds_conteudo) {
        return res.status(400).json({ message: 'Título e conteúdo são obrigatórios.' });
    }
    try {
        // Verifica se já existe um perfil com o mesmo título
        const perfilExistente = yield perfil_1.default.findOne({
            where: { nm_titulo }
        });
        if (perfilExistente) {
            return res.status(400).json({ message: 'Perfil com esse título já existe.' });
        }
        // Cria um novo perfil
        const novoPerfil = yield perfil_1.default.create({
            nm_titulo,
            ds_conteudo,
            // dt_criacao e dt_atualizacao são definidos automaticamente pelo Sequelize
        });
        // Simula um atraso de 2 segundos
        setTimeout(() => {
            // Retorna o perfil criado, omitindo as datas
            const perfilSemDatas = {
                id: novoPerfil.id,
                nm_titulo: novoPerfil.nm_titulo,
                ds_conteudo: novoPerfil.ds_conteudo,
            };
            res.status(201).json(perfilSemDatas);
        }, 2000); // Atraso de 2 segundos
    }
    catch (error) {
        console.error('Erro ao criar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.createPerfil = createPerfil;
const updatePerfil = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // O ID é esperado como parte dos parâmetros da URL
    const { nm_titulo, ds_conteudo } = req.body;
    // Verifica se o ID e os dados necessários foram fornecidos
    if (!id || !nm_titulo || !ds_conteudo) {
        return res.status(400).json({ message: 'ID, título e conteúdo são obrigatórios.' });
    }
    try {
        // Encontra o perfil pelo ID
        const perfilExistente = yield perfil_1.default.findByPk(id);
        if (!perfilExistente) {
            return res.status(404).json({ message: 'Perfil não encontrado.' });
        }
        // Simula um delay antes de atualizar
        yield new Promise(resolve => setTimeout(resolve, 2000)); // Delay de 2 segundos
        // Atualiza o perfil com os novos dados
        yield perfilExistente.update({
            nm_titulo,
            ds_conteudo,
            dt_atualizacao: new Date(), // Atualiza a data de atualização para a data atual
        });
        // Retorna o perfil atualizado, omitindo as datas
        const perfilAtualizado = {
            id: perfilExistente.id,
            nm_titulo: perfilExistente.nm_titulo,
            ds_conteudo: perfilExistente.ds_conteudo,
        };
        res.status(200).json(perfilAtualizado);
    }
    catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.updatePerfil = updatePerfil;
