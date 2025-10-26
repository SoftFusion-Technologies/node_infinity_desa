/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 09 / 08 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_RutinaColores.js) contiene la definición del modelo Sequelize para la tabla rutina_colores.
 * Tema: Modelos - Rutinas / Colores
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const RutinaColoresModel = db.define(
  'rutina_colores',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    color_hex: {
      type: DataTypes.CHAR(7), // Ej: #ff0000
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    creado_por: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
      // Si después querés asociar al usuario que lo creó
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false,
    tableName: 'rutina_colores'
  }
);

export default RutinaColoresModel;
