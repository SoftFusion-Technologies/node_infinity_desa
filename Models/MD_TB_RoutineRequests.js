/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 23/05/2025
 * Versión: 1.1
 *
 * Descripción:
 * Definición del modelo Sequelize para la tabla routine_requests.
 * Ahora referencia ejercicios(id) mediante ejercicio_id
 * y se eliminaron routine_id / exercise_id.
 * Tema: Modelos - Routine Requests
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../DataBase/db.js';
import { DataTypes } from 'sequelize';

// Importá tus modelos relacionados
import EjerciciosModel from './Rutinas_V2/MD_TB_Ejercicios.js';
// (Opcional) si tenés el modelo Students:
import StudentsModel from './MD_TB_Students.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const RoutineRequestsModel = db.define(
  'routine_requests',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    student_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    // 🔁 Nuevo FK a ejercicios
    ejercicio_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'atendido'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'routine_requests',
    timestamps: false, // solo existe created_at en la tabla
    indexes: [{ fields: ['student_id'] }, { fields: ['ejercicio_id'] }]
  }
);

// Asociaciones
RoutineRequestsModel.belongsTo(EjerciciosModel, {
  foreignKey: 'ejercicio_id',
  as: 'ejercicio',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE' // o 'SET NULL' si hiciste la FK nullable en la DB
});

// (Opcional) si necesitás navegar al alumno desde la solicitud
RoutineRequestsModel.belongsTo(StudentsModel, {
  foreignKey: 'student_id',
  as: 'student',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
});

export default RoutineRequestsModel;
