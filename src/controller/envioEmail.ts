import { Request, Response } from 'express';
import Empresa from '../models/empresa';
import Perfil from '../models/perfil';
import EnvioEmail, { EnvioEmailCreationAttributes } from '../models/envioEmail';
import nodemailer from 'nodemailer';

// Crie um transporte do Nodemailer com as configurações do seu servidor de e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail', // Exemplo com Gmail, ajuste conforme seu provedor
  secure: true,
  auth: {
    user: process.env.user_mail,
    pass: process.env.user_pass,
  },
});

const enviarEmail = async (
  destinatarios: string[],
  assunto: string,
  corpo: string,
  perfilId?: number
) => {
  try {
    // Recupera o perfil, se existir
    let perfilConteudo = '';
    if (perfilId) {
      const perfil = await Perfil.findByPk(perfilId);
      if (perfil) {
        perfilConteudo = perfil.ds_conteudo;
      }
    }

    // Substitui as macros no corpo do e-mail
    const substituirMacros = (texto: string, empresa: Empresa) => {
      const dataCriacao = empresa.dt_criacao ? new Date(empresa.dt_criacao) : new Date();
      return texto
        .replace(/@nome@/g, empresa.ds_nome)
        .replace(/@status@/g, empresa.ie_status || '')
        .replace(/@cnpj@/g, empresa.cd_cnpj)
        .replace(/@email@/g, empresa.ds_email || '')
        .replace(/@dtcadastro@/g, dataCriacao.toLocaleDateString())
        .replace(/@tel1@/g, empresa.nr_telefone_1 || '')
        .replace(/@processo@/g, empresa.nr_processo?.toString() || '')
        .replace(/@tel2@/g, empresa.nr_telefone_2 || '');
    };

    // Busca todas as empresas de uma vez
    const empresas = await Empresa.findAll({
      where: {
        ds_email: destinatarios,
      },
    });

    // Agrupa as empresas pelos seus e-mails
    const empresasPorEmail = destinatarios.reduce((acc, email) => {
      acc[email] = empresas.filter(e => e.ds_email === email);
      return acc;
    }, {} as Record<string, Empresa[]>);

    // Envia e-mail para cada destinatário em paralelo
    const promises = destinatarios.map(async (destinatario) => {
      const empresasParaEmail = empresasPorEmail[destinatario];

      if (!empresasParaEmail || empresasParaEmail.length === 0) {
        console.warn(`Nenhuma empresa encontrada para o e-mail: ${destinatario}`);
        return;
      }

      // Envia e-mail para cada empresa
      const sendEmailPromises = empresasParaEmail.map(async (empresa) => {
        const corpoFinal = substituirMacros(corpo, empresa);

        try {
          const info = await transporter.sendMail({
            from: process.env.user_mail, 
            to: destinatario,
            subject: assunto,
            html: corpoFinal,
            headers: {
              'X-Mailer': 'Nodemailer',
              'List-Unsubscribe': '<mailto:unsubscribe@dominio.com>',
            },
          }) as nodemailer.SentMessageInfo;

          console.log(`Email enviado para: ${destinatario}, ID da mensagem: ${info.messageId}`);

          // Atualiza a data de vencimento da empresa
          const novaDataVencimento = new Date(empresa.dt_vencimento || Date.now());
          const repeticao = empresa.nr_repeticao || 1; // Valor padrão de 1 mês caso nr_repeticao seja undefined
          novaDataVencimento.setMonth(novaDataVencimento.getMonth() + repeticao);
          await empresa.update({ dt_vencimento: novaDataVencimento });

          // Salva o envio no banco de dados
          await EnvioEmail.create({
            empresa_id: empresa.id,
            perfil_id: perfilId, // Pode ser undefined
            ds_assunto: assunto,
            ds_conteudo: corpoFinal,
            dt_envio: new Date(),
          } as EnvioEmailCreationAttributes);
        } catch (error) {
          console.error(`Erro ao enviar e-mail para ${destinatario}:`, error);
        }
      });

      await Promise.all(sendEmailPromises);
    });

    await Promise.all(promises);

    console.log('E-mails enviados e dados salvos com sucesso.');
  } catch (error) {
    console.error('Erro ao enviar e-mails:', error);
  }
};

export const enviarEmailController = async (req: Request, res: Response) => {
  const { destinatarios, assunto, corpo, perfilId } = req.body;

  try {
    await enviarEmail(destinatarios, assunto, corpo, perfilId);
    res.status(200).json({ message: 'E-mails enviados com sucesso.' });
  } catch (error) {
    console.error('Erro ao enviar e-mails:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const listarEnviosEmailController = async (req: Request, res: Response) => {
  try {
    // Opcional: Adicione filtros aqui se necessário, por exemplo, por empresa_id ou perfil_id
    const envios = await EnvioEmail.findAll({
      // Exemplo de ordenação por data de envio, mais recente primeiro
      order: [['dt_envio', 'DESC']],
    });
    
    res.status(200).json(envios);
  } catch (error) {
    console.error('Erro ao listar envios de e-mail:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};