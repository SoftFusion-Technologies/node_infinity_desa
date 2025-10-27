/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 01 /06 / 2025
 * Versión: 1.1
 *
 * Descripción:
 * Este archivo (MD_TB_StudentMonthlyGoals.js) contiene la definición del modelo Sequelize para la tabla student_monthly_goals,
 * incluyendo campos físicos para seguimiento de progreso mensual.
 * Tema: Modelos - StudentMonthlyGoals
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const StudentMonthlyGoalsModel = db.define(
  'student_monthly_goals',
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
    mes: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    objetivo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('EN_PROGRESO', 'COMPLETADO', 'NO_CUMPLIDO'),
      allowNull: false,
      defaultValue: 'EN_PROGRESO'
    },
    altura_cm: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    peso_kg: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    edad: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    control_antropometrico: {
      type: DataTypes.ENUM('SI', 'NO'),
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'mes', 'anio']
      }
    ]
  }
);

export default StudentMonthlyGoalsModel;
