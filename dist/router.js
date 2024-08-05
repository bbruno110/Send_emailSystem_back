"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Empresa = __importStar(require("./controller/cadastroEmpresa"));
const Perfil = __importStar(require("./controller/cadastroPerfil"));
const Email = __importStar(require("./controller/envioEmail"));
const routes = (0, express_1.Router)();
routes.post('/register-frm', Empresa.cadastrarEmpresa);
routes.get('/list', Empresa.listEmpresas);
routes.put('/edit/:id', Empresa.editEmpresa);
routes.get('/empresas/list', Empresa.listarEmpresasVencimentoMesAtual);
routes.get('/empresas/intervalo-datas', Empresa.listarEmpresasPorIntervaloDatas);
routes.put('/update-status', Empresa.updateStatus);
routes.get('/list-perfil', Perfil.getAllPerfis);
routes.post('/create-perfil', Perfil.createPerfil);
routes.put('/update-perfil/:id', Perfil.updatePerfil);
routes.post('/sendmail', Email.enviarEmailController);
routes.get('/send-list', Email.listarEnviosEmailController);
exports.default = routes;
