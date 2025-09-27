/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 21 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (relaciones.js) define todas las relaciones entre los modelos Sequelize del sistema.
 *
 * Tema: Relaciones entre modelos
 * Capa: Backend
 */

// Importaciones de modelos
import { LocalesModel } from './MD_TB_Locales.js';

import { UserModel } from './MD_TB_Users.js';


// RELACIONES LOGS - USUARIOS
import { LogModel } from './Seguridad/MD_TB_Logs.js';
// RELACIONES LOGS - USUARIOS



LogModel.belongsTo(UserModel, { foreignKey: 'usuario_id', as: 'usuario' });
UserModel.hasMany(LogModel, { foreignKey: 'usuario_id', as: 'logs' });