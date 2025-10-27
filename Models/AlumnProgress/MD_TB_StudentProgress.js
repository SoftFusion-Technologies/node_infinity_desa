/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06/06/2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (MD_TB_StudentProgress.js) contiene la definición del modelo Sequelize
 * para la tabla student_progress, utilizado para registrar avances físicos del alumno.
 * Tema: Modelos - StudentProgress
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const StudentProgressModel = db.define(
  'student_progress',
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
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    peso_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    altura_cm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    grasa_corporal: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    cintura_cm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    imc: {
      type: DataTypes.VIRTUAL,
      get() {
        const peso = parseFloat(this.getDataValue('peso_kg'));
        const altura = parseFloat(this.getDataValue('altura_cm'));
        if (peso && altura) {
          return +(peso / Math.pow(altura / 100, 2)).toFixed(2);
        }
        return null;
      }
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  },
  {
    timestamps: false
  }
);

export default StudentProgressModel;
