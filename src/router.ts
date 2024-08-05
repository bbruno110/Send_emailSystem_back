import { Router } from "express";
import * as Empresa from "./controller/cadastroEmpresa";
import * as Perfil from './controller/cadastroPerfil';
import * as Email from './controller/envioEmail';

const routes = Router();

routes.post('/register-frm', Empresa.cadastrarEmpresa);
routes.get('/list', Empresa.listEmpresas);
routes.put('/edit/:id', Empresa.editEmpresa);
routes.get('/empresas/list', Empresa.listarEmpresasVencimentoMesAtual);
routes.get('/empresas/intervalo-datas', Empresa.listarEmpresasPorIntervaloDatas);
routes.put('/update-status', Empresa.updateStatus);

routes.get('/list-perfil', Perfil.getAllPerfis)
routes.post('/create-perfil', Perfil.createPerfil)
routes.put('/update-perfil/:id', Perfil.updatePerfil);

routes.post('/sendmail', Email.enviarEmailController);
routes.get('/send-list', Email.listarEnviosEmailController)

export default routes;