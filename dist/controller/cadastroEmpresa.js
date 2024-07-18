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
exports.listEmpresas = exports.editEmpresa = exports.cadastrarEmpresa = void 0;
const empresa_1 = __importDefault(require("../models/empresa"));
function tratarDadosEmpresa(dados) {
    if (!dados.nome || !dados.cnpj || !dados.tel1 || !dados.email) {
        throw new Error('Dados incompletos para cadastrar empresa');
    }
    const cnpj = dados.cnpj.replace(/[^\d]/g, '');
    const tel1 = dados.tel1.replace(/[^\d]/g, '');
    const tel2 = dados.tel2 ? dados.tel2.replace(/[^\d]/g, '') : '';
    const situacao = dados.situacao || 'A';
    return {
        ds_nome: dados.nome,
        cd_cnpj: cnpj,
        nr_telefone_1: tel1,
        nr_telefone_2: tel2,
        ds_email: dados.email,
        nr_repeticao: dados.repeticao || 0,
        ie_situacao: situacao,
        dt_criacao: new Date(),
        dt_atualizacao: new Date()
    };
}
const cadastrarEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dadosTratados = tratarDadosEmpresa(req.body);
        const empresaExistente = yield empresa_1.default.findOne({
            where: { cd_cnpj: dadosTratados.cd_cnpj }
        });
        if (empresaExistente) {
            setTimeout(() => {
                res.status(400).json({ erro: 'CNPJ já cadastrado' });
            }, 5000);
            return;
        }
        const novaEmpresa = yield empresa_1.default.create(dadosTratados);
        setTimeout(() => {
            res.status(200).json(novaEmpresa);
        }, 5000);
    }
    catch (error) {
        console.error('Erro ao cadastrar empresa:', error);
        setTimeout(() => {
            res.status(500).json({ erro: 'Erro ao cadastrar empresa' });
        }, 5000);
    }
});
exports.cadastrarEmpresa = cadastrarEmpresa;
const editEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Obtém o ID da empresa a ser editada
    const { ds_nome, cd_cnpj, nr_telefone_1, nr_telefone_2, ds_email, nr_repeticao, ie_situacao } = req.body; // Obtém os dados atualizados da empresa, incluindo situacao
    try {
        // Busca a empresa pelo ID no banco de dados
        const empresa = yield empresa_1.default.findByPk(id);
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        // Atualiza os campos da empresa com os novos dados, incluindo situacao
        empresa.ds_nome = ds_nome;
        empresa.cd_cnpj = cd_cnpj;
        empresa.nr_telefone_1 = nr_telefone_1;
        empresa.nr_telefone_2 = nr_telefone_2;
        empresa.ds_email = ds_email;
        empresa.nr_repeticao = nr_repeticao;
        empresa.ie_situacao = ie_situacao;
        // Simula um atraso de 3 segundos antes de salvar
        yield new Promise(resolve => setTimeout(resolve, 3000));
        // Salva as alterações no banco de dados
        yield empresa.save();
        // Retorna a empresa atualizada como resposta
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
