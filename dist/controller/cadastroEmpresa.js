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
exports.updateStatus = exports.listarEmpresasPorIntervaloDatas = exports.listarEmpresasVencimentoMesAtual = exports.listEmpresas = exports.editEmpresa = exports.cadastrarEmpresa = void 0;
const empresa_1 = __importDefault(require("../models/empresa"));
const sequelize_1 = require("sequelize");
// Função para adicionar meses a uma data
const adicionarMeses = (data, meses) => {
    const novaData = new Date(data);
    novaData.setMonth(novaData.getMonth() + meses);
    return novaData;
};
function tratarDadosEmpresa(dados) {
    if (!dados.nome || !dados.documento || !dados.tel1 || !dados.email || !dados.nr_processo) {
        throw new Error('Dados incompletos para cadastrar empresa');
    }
    const cnpj = dados.tipoDocumento === 'CNPJ' ? dados.documento.replace(/[^\d]/g, '') : null;
    const cpf = dados.tipoDocumento === 'CPF' ? dados.documento.replace(/[^\d]/g, '') : null;
    const tel1 = dados.tel1.replace(/[^\d]/g, '');
    const tel2 = dados.tel2 ? dados.tel2.replace(/[^\d]/g, '') : '';
    const situacao = dados.situacao || 'A';
    const valor = dados.nr_valor ? parseFloat(dados.nr_valor) : null;
    const processo = dados.dt_processo ? new Date(dados.dt_processo) : null;
    const repeticao = dados.repeticao || 0;
    const nrProcesso = dados.nr_processo;
    const dataCriacao = new Date();
    const dtVencimento = adicionarMeses(dataCriacao, repeticao);
    return {
        ds_nome: dados.nome,
        cd_cnpj: cnpj,
        nr_cpf: cpf,
        nr_telefone_1: tel1,
        nr_telefone_2: tel2,
        ds_email: dados.email,
        nr_repeticao: repeticao,
        ie_situacao: situacao,
        dt_criacao: dataCriacao,
        dt_atualizacao: new Date(),
        nr_valor: valor,
        dt_processo: processo,
        dt_vencimento: dtVencimento,
        ie_status: 'Inicial',
        nr_processo: nrProcesso,
    };
}
const cadastrarEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dadosTratados = tratarDadosEmpresa(req.body);
        const empresaExistente = yield empresa_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    {
                        cd_cnpj: dadosTratados.cd_cnpj || { [sequelize_1.Op.is]: null },
                        nr_cpf: dadosTratados.cd_cnpj ? { [sequelize_1.Op.is]: null } : dadosTratados.nr_cpf
                    },
                    {
                        nr_cpf: dadosTratados.nr_cpf || { [sequelize_1.Op.is]: null },
                        cd_cnpj: dadosTratados.nr_cpf ? { [sequelize_1.Op.is]: null } : dadosTratados.cd_cnpj
                    }
                ]
            }
        });
        if (empresaExistente) {
            res.status(226).json({ erro: 'CNPJ ou CPF já cadastrado' });
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
    const { ds_nome, cd_cnpj, nr_cpf, nr_telefone_1, nr_telefone_2, ds_email, nr_repeticao, ie_situacao, nr_valor, dt_processo, ie_status, nr_processo } = req.body;
    try {
        const empresa = yield empresa_1.default.findByPk(id);
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        // Validação para garantir que não exista CPF e CNPJ ao mesmo tempo
        if ((nr_cpf && empresa.cd_cnpj) || (cd_cnpj && empresa.nr_cpf)) {
            return res.status(400).json({ error: 'Não é permitido fornecer tanto CPF quanto CNPJ ao mesmo tempo' });
        }
        // Validação de dados duplicados
        const existingEmail = yield empresa_1.default.findOne({
            where: { ds_email, id: { [sequelize_1.Op.ne]: id } }
        });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email já está cadastrado' });
        }
        const existingCpf = nr_cpf ? yield empresa_1.default.findOne({
            where: { nr_cpf, id: { [sequelize_1.Op.ne]: id } }
        }) : null;
        if (existingCpf) {
            return res.status(400).json({ error: 'CPF já está cadastrado' });
        }
        const existingCnpj = cd_cnpj ? yield empresa_1.default.findOne({
            where: { cd_cnpj, id: { [sequelize_1.Op.ne]: id } }
        }) : null;
        if (existingCnpj) {
            return res.status(400).json({ error: 'CNPJ já está cadastrado' });
        }
        empresa.ds_nome = ds_nome || empresa.ds_nome;
        empresa.cd_cnpj = cd_cnpj || empresa.cd_cnpj;
        empresa.nr_cpf = nr_cpf || empresa.nr_cpf;
        empresa.nr_telefone_1 = nr_telefone_1 || empresa.nr_telefone_1;
        empresa.nr_telefone_2 = nr_telefone_2;
        empresa.ds_email = ds_email || empresa.ds_email;
        empresa.nr_repeticao = nr_repeticao || empresa.nr_repeticao;
        empresa.ie_situacao = ie_situacao || empresa.ie_situacao;
        empresa.nr_valor = nr_valor || empresa.nr_valor;
        empresa.dt_processo = dt_processo ? new Date(dt_processo) : empresa.dt_processo;
        empresa.nr_processo = nr_processo || empresa.nr_processo;
        empresa.ie_status = ie_status || empresa.ie_status;
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
        const empresas = yield empresa_1.default.findAll({
            attributes: ['id', 'ds_nome', 'ds_email', 'cd_cnpj', 'nr_telefone_1', 'nr_telefone_2', 'nr_repeticao', 'ie_situacao', 'dt_processo', 'nr_valor', 'nr_processo', 'nr_cpf'],
            order: [['ds_nome', 'ASC']]
        });
        return res.status(200).json(empresas);
    }
    catch (error) {
        console.error('Erro ao listar empresas:', error);
        return res.status(500).json({ error: 'Erro interno ao listar empresas' });
    }
});
exports.listEmpresas = listEmpresas;
const listarEmpresasVencimentoMesAtual = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pagina = 1, itensPorPagina = 10, statusVencimento, ie_status, start_date, end_date } = req.query;
    console.log('Parâmetros recebidos:', {
        pagina,
        itensPorPagina,
        statusVencimento,
        ie_status,
        start_date,
        end_date
    });
    try {
        const startDate = start_date ? new Date(start_date) : new Date(0); // Data mínima possível
        const endDate = end_date ? new Date(end_date) : new Date();
        const dataAtual = new Date();
        const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
        let whereClause = {
            ie_situacao: 'A'
        };
        if (statusVencimento === 'vencidas') {
            whereClause.dt_vencimento = {
                [sequelize_1.Op.lt]: dataAtual
            };
        }
        else if (statusVencimento === 'proximas') {
            whereClause.dt_vencimento = {
                [sequelize_1.Op.between]: [dataAtual, ultimoDiaMes]
            };
        }
        else if (statusVencimento === 'naoVencidas') {
            whereClause.dt_vencimento = {
                [sequelize_1.Op.gt]: dataAtual
            };
        }
        else if (statusVencimento === '') {
            delete whereClause.dt_vencimento;
        }
        if (statusVencimento) {
            whereClause.dt_processo = {
                [sequelize_1.Op.between]: [startDate, endDate]
            };
        }
        if (ie_status && ie_status !== '') {
            whereClause.ie_status = ie_status;
        }
        const limit = Math.max(1, Number(itensPorPagina) || 10);
        const paginaAtual = Math.max(1, Number(pagina) || 1);
        const offset = Math.max(0, (paginaAtual - 1) * limit);
        console.log(`Page: ${paginaAtual}, Items per Page: ${limit}, Offset: ${offset}`);
        const { count, rows: empresas } = yield empresa_1.default.findAndCountAll({
            where: whereClause,
            attributes: [
                'id',
                'ds_nome',
                'cd_cnpj',
                'nr_telefone_1',
                'nr_telefone_2',
                'ds_email',
                'nr_repeticao',
                'ie_situacao',
                'dt_vencimento',
                'dt_processo',
                'nr_valor',
                'ie_status',
                'nr_processo',
                'nr_cpf'
            ],
            order: [['dt_vencimento', 'ASC'], ['ds_nome', 'ASC']],
            limit: limit,
            offset: offset,
            logging: (msg) => console.log('SQL Query:', msg)
        });
        const totalPaginas = Math.ceil(count / limit);
        return res.status(200).json({
            totalItems: count,
            totalPaginas: totalPaginas,
            paginaAtual: paginaAtual,
            itensPorPagina: limit,
            empresas: empresas
        });
    }
    catch (error) {
        console.error('Erro interno ao listar empresas com vencimento no mês atual:', error);
        return res.status(500).json({ error: 'Erro interno ao listar empresas com vencimento no mês atual' });
    }
});
exports.listarEmpresasVencimentoMesAtual = listarEmpresasVencimentoMesAtual;
const listarEmpresasPorIntervaloDatas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dataInicio, dataFim } = req.query;
    if (!dataInicio || !dataFim) {
        return res.status(400).json({ error: 'Data de início e data de fim são necessárias' });
    }
    try {
        const empresas = yield empresa_1.default.findAll({
            where: {
                dt_processo: {
                    [sequelize_1.Op.between]: [new Date(dataInicio), new Date(dataFim)],
                },
                ie_situacao: 'A'
            },
            attributes: [
                'id',
                'ds_nome',
                'cd_cnpj',
                'nr_telefone_1',
                'nr_telefone_2',
                'ds_email',
                'ie_situacao',
                'dt_processo',
                'nr_valor',
                'nr_processo',
                'nr_cpf'
            ],
            order: [['ds_nome', 'ASC']]
        });
        const totalValorResult = yield empresa_1.default.sum('nr_valor', {
            where: {
                dt_processo: {
                    [sequelize_1.Op.between]: [new Date(dataInicio), new Date(dataFim)],
                },
                ie_situacao: 'A'
            }
        });
        return res.status(200).json({
            total: totalValorResult,
            empresas
        });
    }
    catch (error) {
        console.error('Erro ao listar empresas por intervalo de datas:', error);
        return res.status(500).json({ error: 'Erro interno ao listar empresas por intervalo de datas' });
    }
});
exports.listarEmpresasPorIntervaloDatas = listarEmpresasPorIntervaloDatas;
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids, ie_status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !ie_status) {
        return res.status(400).json({ error: 'IDs e status são necessários' });
    }
    try {
        const [updated] = yield empresa_1.default.update({
            ie_status,
            dt_atualizacao: new Date(),
        }, {
            where: {
                id: ids,
            },
        });
        if (updated === 0) {
            return res.status(404).json({ error: 'Nenhuma empresa encontrada com os IDs fornecidos' });
        }
        return res.status(200).json({ message: 'Status e data de atualização atualizados com sucesso' });
    }
    catch (error) {
        console.error('Erro ao atualizar o status das empresas:', error);
        return res.status(500).json({ error: 'Erro interno ao atualizar o status das empresas' });
    }
});
exports.updateStatus = updateStatus;
