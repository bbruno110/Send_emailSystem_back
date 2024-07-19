import { Request, Response } from 'express';
import Empresa from '../models/empresa';
import { Op } from 'sequelize';

function tratarDadosEmpresa(dados: any): any {
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

export const cadastrarEmpresa = async (req: Request, res: Response) => {
    try {
        const dadosTratados = tratarDadosEmpresa(req.body);

        const empresaExistente = await Empresa.findOne({
            where: { cd_cnpj: dadosTratados.cd_cnpj }
        });

        if (empresaExistente) {
            setTimeout(() => {
                res.status(400).json({ erro: 'CNPJ já cadastrado' });
            }, 5000);
            return;
        }

        const novaEmpresa = await Empresa.create(dadosTratados);
        setTimeout(() => {
            res.status(200).json(novaEmpresa);
        }, 5000);
    } catch (error) {
        console.error('Erro ao cadastrar empresa:', error);
        setTimeout(() => {
            res.status(500).json({ erro: 'Erro ao cadastrar empresa' });
        }, 5000);
    }
}

export const editEmpresa = async (req: Request, res: Response) => {
    const { id } = req.params; // Obtém o ID da empresa a ser editada
    const { ds_nome, cd_cnpj, nr_telefone_1, nr_telefone_2, ds_email, nr_repeticao, ie_situacao } = req.body; // Obtém os dados atualizados da empresa, incluindo situacao
  
    try {
      // Busca a empresa pelo ID no banco de dados
      const empresa = await Empresa.findByPk(id);
  
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
      await new Promise(resolve => setTimeout(resolve, 3000));
  
      // Salva as alterações no banco de dados
      await empresa.save();
  
      // Retorna a empresa atualizada como resposta
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
        attributes: ['id', 'ds_nome', 'ds_email', 'cd_cnpj', 'nr_telefone_1', 'nr_telefone_2', 'nr_repeticao', 'ie_situacao'],
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
    try {
      const dataAtual = new Date();
      const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
      const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
  
      // Busca todas as empresas com dt_vencimento dentro do mês atual
      const empresas = await Empresa.findAll({
        where: {
          dt_vencimento: {
            [Op.between]: [primeiroDiaMes, ultimoDiaMes]
          },
          ie_situacao: 'A' // Filtra apenas as empresas ativas
        },
        attributes: ['id', 'ds_nome', 'cd_cnpj', 'nr_telefone_1', 'nr_telefone_2', 'ds_email', 'nr_repeticao', 'ie_situacao', 'dt_vencimento'],
        order: [['ds_nome', 'ASC']]
      });
  
      // Retorna a lista de empresas como resposta
      return res.status(200).json(empresas);
    } catch (error) {
      console.error('Erro ao listar empresas com vencimento no mês atual:', error);
      return res.status(500).json({ error: 'Erro interno ao listar empresas com vencimento no mês atual' });
    }
  };