/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo contiene la definición del modelo Sequelize para la tabla `bloques`,
 * que representa un bloque de ejercicios dentro de una rutina.
 *
 * Tema: Modelos - Bloques
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const BloquesModel = db.define(
  'bloques',
  {
    rutina_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'rutinas',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Bloque'
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    color_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    timestamps: false
  }
);

export default BloquesModel;
