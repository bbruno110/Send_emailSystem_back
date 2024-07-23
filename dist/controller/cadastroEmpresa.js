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
exports.listarEmpresasVencimentoMesAtual = exports.listEmpresas = exports.editEmpresa = exports.cadastrarEmpresa = void 0;
const empresa_1 = __importDefault(require("../models/empresa"));
const sequelize_1 = require("sequelize");
function tratarDadosEmpresa(dados) {
    if (!dados.nome || !dados.cnpj || !dados.tel1 || !dados.email) {
        throw new Error('Dados incompletos para cadastrar empresa');
    }
    const cnpj = dados.cnpj.replace(/[^\d]/g, '');
    const tel1 = dados.tel1.replace(/[^\d]/g, '');
    const tel2 = dados.tel2 ? dados.tel2.replace(/[^\d]/g, '') : '';
    const situacao = dados.situacao || 'A';
    const valor = dados.nr_valor ? parseFloat(dados.nr_valor) : null; // Processa nr_valor
    const processo = dados.dt_processo ? new Date(dados.dt_processo) : null; // Processa dt_processo
    const vencimento = dados.dt_vencimento ? new Date(dados.dt_vencimento) : null; // Processa dt_vencimento
    return {
        ds_nome: dados.nome,
        cd_cnpj: cnpj,
        nr_telefone_1: tel1,
        nr_telefone_2: tel2,
        ds_email: dados.email,
        nr_repeticao: dados.repeticao || 0,
        ie_situacao: situacao,
        dt_criacao: new Date(),
        dt_atualizacao: new Date(),
        nr_valor: valor,
        dt_processo: processo,
        dt_vencimento: vencimento, // Novo campo
    };
}
const cadastrarEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dadosTratados = tratarDadosEmpresa(req.body);
        const empresaExistente = yield empresa_1.default.findOne({
            where: { cd_cnpj: dadosTratados.cd_cnpj }
        });
        if (empresaExistente) {
            res.status(400).json({ erro: 'CNPJ já cadastrado' });
            return;
        }
        const novaEmpresa = yield empresa_1.default.create(dadosTratados);
        res.status(200).json(novaEmpresa);
    }
    catch (error) {
        console.error('Erro ao cadastrar empresa:', error);
        res.status(500).json({ erro: 'Erro ao cadastrar empresa' });
    }
});
exports.cadastrarEmpresa = cadastrarEmpresa;
const editEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { ds_nome, cd_cnpj, nr_telefone_1, nr_telefone_2, ds_email, nr_repeticao, ie_situacao, nr_valor, dt_processo } = req.body;
    try {
        const empresa = yield empresa_1.default.findByPk(id);
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        empresa.ds_nome = ds_nome;
        empresa.cd_cnpj = cd_cnpj;
        empresa.nr_telefone_1 = nr_telefone_1;
        empresa.nr_telefone_2 = nr_telefone_2;
        empresa.ds_email = ds_email;
        empresa.nr_repeticao = nr_repeticao;
        empresa.ie_situacao = ie_situacao;
        empresa.nr_valor = nr_valor; // Atualiza nr_valor
        empresa.dt_processo = dt_processo; // Atualiza dt_processo
        yield empresa.save();
        return res.status(200).json(empresa);
    }
    catch (error) {
        console.error('Erro ao editar a empresa:', error);
        return res.status(500).json({ error: 'Erro interno ao editar a empresa' });
    }
});
exports.editEmpresa = editEmpresa;
const listEmpresas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Busca todas as empresas no banco de dados
        const empresas = yield empresa_1.default.findAll({
            attributes: ['id', 'ds_nome', 'ds_email', 'cd_cnpj', 'nr_telefone_1', 'nr_telefone_2', 'nr_repeticao', 'ie_situacao'],
            order: [['ds_nome', 'ASC']]
        });
        // Retorna a lista de empresas como resposta
        return res.status(200).json(empresas);
    }
    catch (error) {
        console.error('Erro ao listar empresas:', error);
        return res.status(500).json({ error: 'Erro interno ao listar empresas' });
    }
});
exports.listEmpresas = listEmpresas;
const listarEmpresasVencimentoMesAtual = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataAtual = new Date();
        const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
        const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
        // Busca todas as empresas com dt_vencimento dentro do mês atual
        const empresas = yield empresa_1.default.findAll({
            where: {
                dt_vencimento: {
                    [sequelize_1.Op.between]: [primeiroDiaMes, ultimoDiaMes]
                },
                ie_situacao: 'A' // Filtra apenas as empresas ativas
            },
            attributes: ['id', 'ds_nome', 'cd_cnpj', 'nr_telefone_1', 'nr_telefone_2', 'ds_email', 'nr_repeticao', 'ie_situacao', 'dt_vencimento', 'dt_processo', 'nr_valor'],
            order: [['ds_nome', 'ASC']]
        });
        // Retorna a lista de empresas como resposta
        return res.status(200).json(empresas);
    }
    catch (error) {
        console.error('Erro ao listar empresas com vencimento no mês atual:', error);
        return res.status(500).json({ error: 'Erro interno ao listar empresas com vencimento no mês atual' });
    }
});
exports.listarEmpresasVencimentoMesAtual = listarEmpresasVencimentoMesAtual;
