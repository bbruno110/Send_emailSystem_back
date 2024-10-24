import { Request, Response } from 'express';
import Empresa from '../models/empresa';
import Perfil from '../models/perfil';
import EnvioEmail, { EnvioEmailCreationAttributes } from '../models/envioEmail';
import nodemailer from 'nodemailer';
import path from 'path';
import { toZonedTime, format as formatZonedTime } from 'date-fns-tz';
import sequelize from '../instance/conn';

const logoPath = path.join('assets', 'Logo.png');
const timeZone = 'America/Sao_Paulo';

export const getCurrentDateTimeInTimeZone = () => {
  const now = new Date();
  const zonedDate = toZonedTime(now, timeZone);
  return formatZonedTime(zonedDate, 'dd/MM/yyyy HH:mm:ss', { timeZone });
};

const parseDateStringUTC = (dateString: string): Date => {
  // Quebrar a string em partes
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  // Criar o objeto Date em UTC
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
};

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: process.env.user_mail,
    pass: process.env.user_pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const enviarEmail = async (
  destinatarios: string[],
  assunto: string,
  corpo: string,
  perfilId?: number
) => {
  const transaction = await sequelize.transaction(); // Iniciar a transação

  try {
    let perfilConteudo = '';
    if (perfilId) {
      const perfil = await Perfil.findByPk(perfilId);
      if (perfil) {
        perfilConteudo = perfil.ds_conteudo;
      }
    }

    const substituirMacros = (texto: string, empresa: Empresa) => {
      const dataCriacao = empresa.dt_criacao ? new Date(empresa.dt_criacao) : new Date();
      return texto
        .replace(/@nome@/g, empresa.ds_nome)
        .replace(/@status@/g, empresa.ie_status || '')
        .replace(/@cnpj@/g, empresa.cd_cnpj || '')
        .replace(/@cpf@/g, empresa.nr_cpf || '')
        .replace(/@email@/g, empresa.ds_email || '')
        .replace(/@dtcadastro@/g, dataCriacao.toLocaleDateString())
        .replace(/@tel1@/g, empresa.nr_telefone_1 || '')
        .replace(/@processo@/g, empresa.nr_processo?.toString() || '')
        .replace(/@tel2@/g, empresa.nr_telefone_2 || '');
    };

    const empresas = await Empresa.findAll({
      where: {
        id: destinatarios,
      },
    });

    const empresasPorId = destinatarios.reduce((acc, id) => {
      const empresa = empresas.find((e) => e.id === Number(id));
      if (empresa) {
        acc[id] = empresa;
      }
      return acc;
    }, {} as Record<string, Empresa>);

    const promises = destinatarios.map(async (destinatario) => {
      const empresa = empresasPorId[destinatario];

      if (!empresa) {
        console.warn(`Nenhuma empresa encontrada para o ID: ${destinatario}`);
        return;
      }

      const corpoFinal = substituirMacros(corpo, empresa);

      const dataEnvio = new Date();
      const dataEnvioZoned = toZonedTime(dataEnvio, timeZone);
      const dataEnvioFormatada = formatZonedTime(dataEnvioZoned, 'dd/MM/yyyy HH:mm:ss', { timeZone });

      try {
        const novaDataVencimento = new Date(empresa.dt_vencimento || Date.now());
        const repeticao = empresa.nr_repeticao || 1;
        novaDataVencimento.setMonth(novaDataVencimento.getMonth() + repeticao);
        await empresa.update({ dt_vencimento: novaDataVencimento }, { transaction });

        const date = parseDateStringUTC(getCurrentDateTimeInTimeZone());
        await EnvioEmail.create({
          empresa_id: empresa.id,
          perfil_id: perfilId,
          ds_assunto: assunto,
          ds_conteudo: corpoFinal,
          dt_envio: date,
        } as EnvioEmailCreationAttributes, { transaction });

        const info = await transporter.sendMail({
          from: `"Usina Marcas e Patentes" <${process.env.user_mail}>`,
          to: empresa.ds_email,
          subject: assunto,
          html: `
    ${corpoFinal}<br><br>
    <img src="cid:logo" width="165" height="165"/><br><br>
    <strong>ALESSANDRE ACHY</strong><br>
    71 99267-0000<br><br>
    usinamarcasepatentes@gmail.com<br><br>
    Rua Hormindo Barros, n° 760, Sala 10<br>
    Paseo Candeias, Bairro Candeias<br>
    CEP: 45.029-094<br>
    Vitória da Conquista - Bahia
  `,
          attachments: [
            {
              filename: 'Logo.png',
              path: logoPath,
              cid: 'logo', // Este CID deve corresponder ao src do HTML
            },
          ],
          headers: {
            'X-Mailer': 'Nodemailer',
            'List-Unsubscribe': '<mailto:unsubscribe@dominio.com>',
          },
        }) as nodemailer.SentMessageInfo;

        console.log(`Email enviado para: ${empresa.ds_email}, ID da mensagem: ${info.messageId}`);
      } catch (error) {
        console.error(`Erro ao enviar e-mail para ${empresa.ds_email}:`, error);
        throw error; // Lança o erro para que a transação seja revertida
      }
    });

    await Promise.all(promises);

    await transaction.commit(); // Commit da transação

    console.log('E-mails enviados e dados salvos com sucesso.');
  } catch (error) {
    await transaction.rollback(); // Rollback da transação em caso de erro
    console.error('Erro ao enviar e-mails:', error);
  }
};

export const enviarEmailController = async (req: Request, res: Response) => {
  const { destinatarios, assunto, corpo, perfilId } = req.body;

  try {
    // 1. Obter as empresas com base nos IDs fornecidos em `destinatarios`
    const empresas = await Empresa.findAll({
      where: {
        id: destinatarios,
      },
      attributes: ['id', 'ds_email', 'dt_vencimento', 'nr_repeticao'],
    });

    // 2. Extraia os IDs e e-mails das empresas encontradas
    const listaEmails = empresas.map((empresa) => ({
      id: empresa.id.toString(),
      email: empresa.ds_email,
      dt_vencimento: empresa.dt_vencimento,
      nr_repeticao: empresa.nr_repeticao,
    }));

    if (listaEmails.length === 0) {
      return res.status(404).json({ error: 'Nenhuma empresa encontrada para os IDs fornecidos.' });
    }

    // 3. Envie os e-mails usando o serviço de e-mail
    const emails = listaEmails.map(item => item.email).filter((email): email is string => Boolean(email));
    const ids = listaEmails.map(item => item.id);

    await enviarEmail(ids, assunto, corpo, perfilId);

    // 4. Atualizar a data de vencimento
    const empresasAtualizadas = await Promise.all(
      listaEmails.map(async (empresa) => {
        if (empresa.dt_vencimento && empresa.nr_repeticao) {
          const novaDataVencimento = new Date(empresa.dt_vencimento);
          novaDataVencimento.setMonth(novaDataVencimento.getMonth() + empresa.nr_repeticao);

          // Atualizar a empresa com a nova data de vencimento
          await Empresa.update(
            { dt_vencimento: novaDataVencimento },
            { where: { id: empresa.id } }
          );
        }
        return empresa.id;
      })
    );

    res.status(200).json({
      message: 'E-mails enviados com sucesso e datas de vencimento atualizadas.',
      empresasAtualizadas,
    });
  } catch (error) {
    console.error('Erro ao enviar e-mails:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const listarEnviosEmailController = async (req: Request, res: Response) => {
  try {
    const envios = await EnvioEmail.findAll({
      order: [['dt_envio', 'DESC']],
    });

    res.status(200).json(envios);
  } catch (error) {
    console.error('Erro ao listar envios de e-mail:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
