import { Request, Response } from 'express';
import Empresa from '../models/empresa';
import { Op } from 'sequelize';

// Função para adicionar meses a uma data
const adicionarMeses = (data: Date, meses: number): Date => {
  const novaData = new Date(data);
  novaData.setMonth(novaData.getMonth() + meses);
  return novaData;
};

function tratarDadosEmpresa(dados: any): any {
  if (!dados.nome || !dados.documento || !dados.tel1 || !dados.email) {
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
export const cadastrarEmpresa = async (req: Request, res: Response) => {
  try {
    const dadosTratados = tratarDadosEmpresa(req.body);

    const empresaExistente = await Empresa.findOne({
      where: {
        [Op.or]: [
          {
            cd_cnpj: dadosTratados.cd_cnpj || { [Op.is]: null },
            nr_cpf: dadosTratados.cd_cnpj ? { [Op.is]: null } : dadosTratados.nr_cpf
          },
          {
            nr_cpf: dadosTratados.nr_cpf || { [Op.is]: null },
            cd_cnpj: dadosTratados.nr_cpf ? { [Op.is]: null } : dadosTratados.cd_cnpj
          }
        ]
      }
    });

    /*if (empresaExistente) {
      res.status(226).json({ erro: 'CNPJ ou CPF já cadastrado' });
      return;
    }*/

    const novaEmpresa = await Empresa.create(dadosTratados);
    res.status(200).json(novaEmpresa);
  } catch (error) {
    console.error('Erro ao cadastrar empresa:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar empresa' });
  }
};

export const editEmpresa = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    ds_nome,
    cd_cnpj,
    nr_cpf,
    nr_telefone_1,
    nr_telefone_2,
    ds_email,
    nr_repeticao,
    ie_situacao,
    nr_valor,
    dt_processo,
    ie_status,
    nr_processo
  } = req.body;

  try {
    const empresa = await Empresa.findByPk(id);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Validação para garantir que não exista CPF e CNPJ ao mesmo tempo
    if ((nr_cpf && empresa.cd_cnpj) || (cd_cnpj && empresa.nr_cpf)) {
      return res.status(400).json({ error: 'Não é permitido fornecer tanto CPF quanto CNPJ ao mesmo tempo' });
    }

    const existingCpf = nr_cpf ? await Empresa.findOne({
      where: { nr_cpf, id: { [Op.ne]: id } }
    }) : null;

    /*if (existingCpf) {
      return res.status(400).json({ error: 'CPF já está cadastrado' });
    }

    const existingCnpj = cd_cnpj ? await Empresa.findOne({
      where: { cd_cnpj, id: { [Op.ne]: id } }
    }) : null;

    if (existingCnpj) {
      return res.status(400).json({ error: 'CNPJ já está cadastrado' });
    }
    */
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

    await empresa.save();

    return res.status(200).json(empresa);
  } catch (error) {
    console.error('Erro ao editar a empresa:', error);
    return res.status(500).json({ error: 'Erro interno ao editar a empresa' });
  }
};


export const listEmpresas = async (req: Request, res: Response) => {
  try {
    const empresas = await Empresa.findAll({
      attributes: ['id', 'ds_nome', 'ds_email', 'cd_cnpj', 'nr_telefone_1', 'nr_telefone_2', 'nr_repeticao', 'ie_situacao', 'dt_processo', 'nr_valor', 'nr_processo', 'nr_cpf'],
      order: [['ds_nome', 'ASC']]
    });

    return res.status(200).json(empresas);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return res.status(500).json({ error: 'Erro interno ao listar empresas' });
  }
};

export const listarEmpresasVencimentoMesAtual = async (req: Request, res: Response) => {
  const { pagina = 1, itensPorPagina = 10, statusVencimento, ie_status, start_date, end_date } = req.query;

  console.log('Parâmetros recebidos:', {
    pagina,
    itensPorPagina,
    statusVencimento,
    ie_status,
    start_date,
    end_date,
  });

  try {
    const startDate = start_date ? new Date(start_date as string) : new Date(0); // Data mínima possível
    const endDate = end_date ? new Date(end_date as string) : new Date();
    const dataAtual = new Date();
    const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);

    let whereClause: any = {
      ie_situacao: 'A', // Filtro para situação ativa
      nr_repeticao: { [Op.gt]: 0 }, // Filtro para exibir apenas empresas com nr_repeticao > 0
    };

    // Filtro baseado em 'statusVencimento' E sempre considerando o intervalo de 'start_date' e 'end_date'
    if (statusVencimento && statusVencimento !== '') {
      // Caso 'statusVencimento' esteja definido
      if (statusVencimento === 'vencidas') {
        whereClause.dt_vencimento = {
          [Op.lt]: dataAtual,
          [Op.between]: [startDate, endDate], // Filtra entre o intervalo fornecido
        };
      } else if (statusVencimento === 'proximas') {
        // Considera o intervalo entre data atual e o último dia do mês, e também entre start_date e end_date
        whereClause.dt_vencimento = {
          [Op.between]: [
            dataAtual > startDate ? dataAtual : startDate, // Pega a maior data entre 'dataAtual' e 'startDate'
            ultimoDiaMes < endDate ? ultimoDiaMes : endDate // Pega a menor data entre 'ultimoDiaMes' e 'endDate'
          ]
        };
      
      } else if (statusVencimento === 'naoVencidas') {
        whereClause.dt_vencimento = {
          [Op.gt]: dataAtual,
          [Op.between]: [startDate, endDate], // Filtra entre o intervalo fornecido
        };
      }
    } else {
      // Caso 'statusVencimento' seja nulo/indefinido ou vazio, filtrar com base em 'dt_processo'
      whereClause.dt_processo = {
        [Op.gte]: startDate, // Filtra pelo intervalo de 'dt_processo'
      };
    }

    // Filtro adicional para 'ie_status', se fornecido
    if (ie_status && ie_status !== '') {
      whereClause.ie_status = ie_status;
    }

    const limit = Math.max(1, Number(itensPorPagina) || 10); // Número de itens por página
    const paginaAtual = Math.max(1, Number(pagina) || 1); // Página atual
    const offset = Math.max(0, (paginaAtual - 1) * limit); // Cálculo do deslocamento

    console.log(`Page: ${paginaAtual}, Items per Page: ${limit}, Offset: ${offset}`);

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
        'ie_status',
        'nr_processo',
        'nr_cpf',
      ],
      order: [['dt_vencimento', 'ASC'], ['ds_nome', 'ASC']],
      limit: limit,
      offset: offset,
      logging: (msg) => console.log('SQL Query:', msg),
    });

    const totalPaginas = Math.ceil(count / limit);

    return res.status(200).json({
      totalItems: count,
      totalPaginas: totalPaginas,
      paginaAtual: paginaAtual,
      itensPorPagina: limit,
      empresas: empresas,
    });
  } catch (error) {
    console.error('Erro interno ao listar empresas com vencimento no mês atual:', error);
    return res.status(500).json({ error: 'Erro interno ao listar empresas com vencimento no mês atual' });
  }
};

export const listarEmpresasPorIntervaloDatas = async (req: Request, res: Response) => {
  const { dataInicio, dataFim } = req.query;

  if (!dataInicio || !dataFim) {
    return res.status(400).json({ error: 'Data de início e data de fim são necessárias' });
  }

  try {
    const empresas = await Empresa.findAll({
      where: {
        dt_processo: {
          [Op.between]: [new Date(dataInicio as string), new Date(dataFim as string)],
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

    const totalValorResult = await Empresa.sum('nr_valor', {
      where: {
        dt_processo: {
          [Op.between]: [new Date(dataInicio as string), new Date(dataFim as string)],
        },
        ie_situacao: 'A'
      }
    });

    return res.status(200).json({
      total: totalValorResult,
      empresas
    });
  } catch (error) {
    console.error('Erro ao listar empresas por intervalo de datas:', error);
    return res.status(500).json({ error: 'Erro interno ao listar empresas por intervalo de datas' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  const { ids, ie_status } = req.body;

  if (!Array.isArray(ids) || ids.length === 0 || !ie_status) {
    return res.status(400).json({ error: 'IDs e status são necessários' });
  }

  try {
    const [updated] = await Empresa.update(
      {
        ie_status,
        dt_atualizacao: new Date(),
      },
      {
        where: {
          id: ids,
        },
      }
    );

    if (updated === 0) {
      return res.status(404).json({ error: 'Nenhuma empresa encontrada com os IDs fornecidos' });
    }

    return res.status(200).json({ message: 'Status e data de atualização atualizados com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar o status das empresas:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar o status das empresas' });
  }
};

export const deletarEmpresa = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Tenta encontrar a empresa pelo ID
    const empresa = await Empresa.findByPk(id);

    // Verifica se a empresa foi encontrada
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Exclui a empresa encontrada
    await empresa.destroy();

    // Retorna uma resposta de sucesso
    return res.status(200).json({ message: 'Empresa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar a empresa:', error);
    return res.status(500).json({ error: 'Erro interno ao deletar a empresa' });
  }
};
