/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 12/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo contiene la definición del modelo Sequelize para la tabla `ejercicios_catalogo`,
 * que representa el catálogo maestro de ejercicios disponibles para asignar a bloques o rutinas.
 *
 * Tema: Modelos - Ejercicios Catálogo
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const EjerciciosCatalogoModel = db.define(
  'ejercicios_catalogo',
  {
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    musculo: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    aliases: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    video_url: {
      type: DataTypes.STRING(255),
      allowNull: true
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

export default EjerciciosCatalogoModel;
