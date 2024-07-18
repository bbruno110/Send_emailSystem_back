import { Router } from "express";
import * as Empresa from "./controller/cadastroEmpresa";
import * as Perfil from './controller/cadastroPerfil';

const routes = Router();

routes.post('/register-frm', Empresa.cadastrarEmpresa);
routes.get('/list', Empresa.listEmpresas);
routes.put('/edit/:id', Empresa.editEmpresa);

routes.get('/list-perfil', Perfil.getAllPerfis)
routes.post('/create-perfil', Perfil.createPerfil)
routes.put('/update-perfil/:id', Perfil.updatePerfil);

export default routes;