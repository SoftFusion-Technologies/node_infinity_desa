/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 19 / 06 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_StudentRM.js) contiene la definición del modelo Sequelize
 * para la tabla student_rms, utilizada para registrar la repetición máxima (RM) de los alumnos.
 *
 * Tema: Modelos - Student RM
 *
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const StudentRMModel = db.define(
  'student_rm',
  {
    student_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    ejercicio: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    peso_levantado: {
      type: DataTypes.DECIMAL(6, 2), // soporta hasta 9999.99
      allowNull: false
    },
    repeticiones: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rm_estimada: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    timestamps: false
  }
);

export default StudentRMModel;
