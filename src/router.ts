import { Router } from "express";
import * as Empresa from "./controller/cadastroEmpresa";
import * as Perfil from './controller/cadastroPerfil';
import * as Email from './controller/envioEmail';

const routes = Router();

routes.post('/register-frm', Empresa.cadastrarEmpresa);
routes.get('/list', Empresa.listEmpresas);
routes.put('/edit/:id', Empresa.editEmpresa);
routes.get('/empresas/list', Empresa.listarEmpresasVencimentoMesAtual);

routes.get('/list-perfil', Perfil.getAllPerfis)
routes.post('/create-perfil', Perfil.createPerfil)
routes.put('/update-perfil/:id', Perfil.updatePerfil);

routes.post('/sendmail', Email.enviarEmailController);

export default routes;