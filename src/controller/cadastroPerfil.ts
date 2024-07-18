import { Request, Response } from 'express';
import Perfil from '../models/perfil';

export const getAllPerfis = async (req: Request, res: Response) => {
  try {
    const perfis = await Perfil.findAll({
      attributes: {
        exclude: ['dt_criacao', 'dt_atualizacao'], // Exclui as datas da resposta
      },
    });

    res.status(200).json(perfis);
  } catch (error) {
    console.error('Erro ao listar perfis:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const createPerfil = async (req: Request, res: Response) => {
    const { nm_titulo, ds_conteudo } = req.body;

    // Verifica se o título e o conteúdo foram fornecidos
    if (!nm_titulo || !ds_conteudo) {
        return res.status(400).json({ message: 'Título e conteúdo são obrigatórios.' });
    }

    try {
        // Verifica se já existe um perfil com o mesmo título
        const perfilExistente = await Perfil.findOne({
            where: { nm_titulo }
        });

        if (perfilExistente) {
            return res.status(400).json({ message: 'Perfil com esse título já existe.' });
        }

        // Cria um novo perfil
        const novoPerfil = await Perfil.create({
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

    } catch (error) {
        console.error('Erro ao criar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

export const updatePerfil = async (req: Request, res: Response) => {
    const { id } = req.params; // O ID é esperado como parte dos parâmetros da URL
    const { nm_titulo, ds_conteudo } = req.body;

    // Verifica se o ID e os dados necessários foram fornecidos
    if (!id || !nm_titulo || !ds_conteudo) {
        return res.status(400).json({ message: 'ID, título e conteúdo são obrigatórios.' });
    }

    try {
        // Encontra o perfil pelo ID
        const perfilExistente = await Perfil.findByPk(id);

        if (!perfilExistente) {
            return res.status(404).json({ message: 'Perfil não encontrado.' });
        }

        // Simula um delay antes de atualizar
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay de 2 segundos

        // Atualiza o perfil com os novos dados
        await perfilExistente.update({
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
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};