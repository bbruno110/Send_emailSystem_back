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
    user: process.env.user_mail ,
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
      const dataCriacao = empresa.dt_criacao instanceof Date ? empresa.dt_criacao : new Date(empresa.dt_criacao);
      return texto
        .replace(/@nome@/g, empresa.ds_nome)
        .replace(/@cnpj@/g, empresa.cd_cnpj)
        .replace(/@email@/g, empresa.ds_email)
        .replace(/@cadastro@/g, dataCriacao.toLocaleDateString())
        .replace(/@tel1@/g, empresa.nr_telefone_1)
        .replace(/@tel2@/g, empresa.nr_telefone_2);
    };

    // Envia o e-mail para cada destinatário e obtém os IDs das empresas
    for (const destinatario of destinatarios) {
      const empresas = await Empresa.findAll({
        where: {
          ds_email: destinatario,
        },
      });

      if (empresas.length === 0) {
        console.warn(`Nenhuma empresa encontrada para o e-mail: ${destinatario}`);
        continue;
      }

      // Envia e-mail para cada empresa
      for (const empresa of empresas) {
        const corpoFinal = substituirMacros(corpo, empresa);

        await transporter.sendMail({
          from: process.env.user_mail, 
          to: destinatario,
          subject: assunto,
          html: corpoFinal,
          headers: {
            'X-Mailer': 'Nodemailer',
            'List-Unsubscribe': '<mailto:unsubscribe@dominio.com>',
          },
        });

        // Atualiza a data de vencimento da empresa
        const novaDataVencimento = new Date(empresa.dt_vencimento);
        novaDataVencimento.setMonth(novaDataVencimento.getMonth() + empresa.nr_repeticao);
        await empresa.update({ dt_vencimento: novaDataVencimento });

        // Salva o envio no banco de dados
        await EnvioEmail.create({
            empresa_id: empresa.id,
            perfil_id: perfilId, // Pode ser undefined
            ds_assunto: assunto,
            ds_conteudo: corpoFinal,
            dt_envio: new Date(),
        } as EnvioEmailCreationAttributes);
      }
    }

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
