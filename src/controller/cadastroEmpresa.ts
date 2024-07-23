import { Request, Response } from 'express';
import Empresa from '../models/empresa';
import { Op } from 'sequelize';
import sequelize from '../instance/conn';

// Função para adicionar meses a uma data
const adicionarMeses = (data: Date, meses: number): Date => {
  const novaData = new Date(data);
  novaData.setMonth(novaData.getMonth() + meses);
  return novaData;
};

// Função para tratar os dados da empresa
function tratarDadosEmpresa(dados: any): any {
  if (!dados.nome || !dados.cnpj || !dados.tel1 || !dados.email) {
    throw new Error('Dados incompletos para cadastrar empresa');
  }

  const cnpj = dados.cnpj.replace(/[^\d]/g, '');
  const tel1 = dados.tel1.replace(/[^\d]/g, '');
  const tel2 = dados.tel2 ? dados.tel2.replace(/[^\d]/g, '') : '';
  const situacao = dados.situacao || 'A';
  const valor = dados.nr_valor ? parseFloat(dados.nr_valor) : null; // Processa nr_valor
  const processo = dados.dt_processo ? new Date(dados.dt_processo) : null; // Processa dt_processo
  const repeticao = dados.repeticao || 0; // Repetição, em meses
  const dataCriacao = new Date(); // Data de criação, pode ser o momento atual ou outra data fornecida

  // Calcula a dt_vencimento
  const dtVencimento = adicionarMeses(dataCriacao, repeticao);

  return {
    ds_nome: dados.nome,
    cd_cnpj: cnpj,
    nr_telefone_1: tel1,
    nr_telefone_2: tel2,
    ds_email: dados.email,
    nr_repeticao: repeticao,
    ie_situacao: situacao,
    dt_criacao: dataCriacao,
    dt_atualizacao: new Date(),
    nr_valor: valor, // Novo campo
    dt_processo: processo, // Novo campo
    dt_vencimento: dtVencimento, // Novo campo calculado
    ie_status: 'Inicial', // Define o status inicial
  };
}

// Função para cadastrar empresa
export const cadastrarEmpresa = async (req: Request, res: Response) => {
  try {
    const dadosTratados = tratarDadosEmpresa(req.body);

    const empresaExistente = await Empresa.findOne({
      where: { cd_cnpj: dadosTratados.cd_cnpj }
    });

    if (empresaExistente) {
      res.status(400).json({ erro: 'CNPJ já cadastrado' });
      return;
    }

    const novaEmpresa = await Empresa.create(dadosTratados);
    res.status(200).json(novaEmpresa);
  } catch (error) {
    console.error('Erro ao cadastrar empresa:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar empresa' });
  }
};

export const editEmpresa = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ds_nome, cd_cnpj, nr_telefone_1, nr_telefone_2, ds_email, nr_repeticao, ie_situacao, nr_valor, dt_processo, ie_status } = req.body;

  try {
    const empresa = await Empresa.findByPk(id);

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
    empresa.ie_status = ie_status; // Atualiza ie_status

    await empresa.save();

    return res.status(200).json(empresa);
  } catch (error) {
    console.error('Erro ao editar a empresa:', error);
    return res.status(500).json({ error: 'Erro interno ao editar a empresa' });
  }
};

export const listEmpresas = async (req: Request, res: Response) => {
  try {
    // Busca todas as empresas no banco de dados
    const empresas = await Empresa.findAll({
      attributes: ['id', 'ds_nome', 'ds_email', 'cd_cnpj', 'nr_telefone_1', 'nr_telefone_2', 'nr_repeticao', 'ie_situacao', 'dt_processo', 'nr_valor'],
      order: [['ds_nome', 'ASC']]
    });

    // Retorna a lista de empresas como resposta
    return res.status(200).json(empresas);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return res.status(500).json({ error: 'Erro interno ao listar empresas' });
  }
};

export const listarEmpresasVencimentoMesAtual = async (req: Request, res: Response) => {
  const { pagina = 1, itensPorPagina = 10, statusVencimento, ie_status, start_date, end_date } = req.query;

  try {
    // Verificar e ajustar as datas fornecidas
    const startDate = start_date ? new Date(start_date as string) : new Date();
    const endDate = end_date ? new Date(end_date as string) : new Date();
    const dataAtual = new Date();
    const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);

    let whereClause: any = {
      dt_processo: {
        [Op.between]: [startDate.toISOString(), endDate.toISOString()]
      },
      ie_situacao: 'A'
    };

    if (statusVencimento === 'vencidas') {
      whereClause.dt_vencimento = {
        [Op.lt]: dataAtual
      };
    } else if (statusVencimento === 'proximas') {
      whereClause.dt_vencimento = {
        [Op.between]: [dataAtual, ultimoDiaMes]
      };
    } else if (statusVencimento === 'naoVencidas') {
      whereClause.dt_vencimento = {
        [Op.gt]: dataAtual
      };
    }

    if (ie_status) {
      whereClause.ie_status = ie_status;
    }

    const limit = Number(itensPorPagina) || 10;
    const offset = (Number(pagina) - 1) * limit;

    const { count, rows: empresas } = await Empresa.findAndCountAll({
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
        'ie_status'
      ],
      order: [['ds_nome', 'ASC']],
      limit: limit,
      offset: offset
    });

    const totalPaginas = Math.ceil(count / limit);

    return res.status(200).json({
      totalItems: count,
      totalPaginas: totalPaginas,
      paginaAtual: Number(pagina),
      itensPorPagina: limit,
      empresas: empresas
    });
  } catch (error) {
    console.error('Erro ao listar empresas com vencimento no mês atual:', error);
    return res.status(500).json({ error: 'Erro interno ao listar empresas com vencimento no mês atual' });
  }
};

export const listarEmpresasPorIntervaloDatas = async (req: Request, res: Response) => {
  const { dataInicio, dataFim } = req.query;

  if (!dataInicio || !dataFim) {
    return res.status(400).json({ error: 'Data de início e data de fim são necessárias' });
  }

  try {
    // Busca todas as empresas dentro do intervalo de datas, sem o campo nr_repeticao
    const empresas = await Empresa.findAll({
      where: {
        dt_processo: {
          [Op.between]: [new Date(dataInicio as string), new Date(dataFim as string)],
        },
        ie_situacao: 'A' // Filtra apenas as empresas ativas
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
        'nr_valor'
      ],
      order: [['ds_nome', 'ASC']]
    });

    // Calcula o total de nr_valor
    const totalValorResult = await Empresa.sum('nr_valor', {
      where: {
        dt_processo: {
          [Op.between]: [new Date(dataInicio as string), new Date(dataFim as string)],
        },
        ie_situacao: 'A' // Filtra apenas as empresas ativas
      }
    });

    // Retorna a lista de empresas e o total de nr_valor
    return res.status(200).json({
      total: totalValorResult,
      empresas
    });
  } catch (error) {
    console.error('Erro ao listar empresas por intervalo de datas:', error);
    return res.status(500).json({ error: 'Erro interno ao listar empresas por intervalo de datas' });
  }
};