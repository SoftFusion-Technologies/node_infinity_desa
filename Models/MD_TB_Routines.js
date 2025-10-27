/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 23 /05 / 2025
 * Versión: 1.0
 *
 * Descripción:
 *Este archivo (MD_TB_Routines.js) contiene la definición del modelo Sequelize para la tabla routines.
 * Tema: Modelos - Routines
 * Capa: Backend
 */

// Importa la configuración de la base de datos y los tipos de datos necesarios
import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';
import RoutineExercisesModel from './MD_TB_RoutineExercises.js';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const RoutinesModel = db.define(
  'routines',
  {
    student_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    instructor_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    mes: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    completado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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


export default RoutinesModel;
