/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 16/08/2025
 * Versión: 1.0
 *
 * Descripción:
 * Modelo Sequelize para la tabla `pse_registros`.
 * Permite registrar PSE/RPE en distintos niveles (rutina, bloque, ejercicio, serie),
 * con soporte para múltiples escalas (RPE_10, BORG_6_20, CR10),
 * y campos opcionales como RIR, dolor, fatiga y duración (para sRPE).
 * Tema: Modelos - PSE/RPE
 * Capa: Backend
 */

import dotenv from 'dotenv';
import db from '../../DataBase/db.js';
import { DataTypes } from 'sequelize';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const PseRegistrosModel = db.define(
  'pse_registros',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },

    // Quién reporta
    student_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'students', key: 'id' },
      onDelete: 'CASCADE'
    },

    // Dónde ocurrió (opcionales según nivel)
    rutina_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'rutinas', key: 'id' },
      onDelete: 'CASCADE'
    },
    bloque_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'bloques', key: 'id' },
      onDelete: 'CASCADE'
    },
    ejercicio_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'ejercicios', key: 'id' },
      onDelete: 'CASCADE'
    },
    serie_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'series', key: 'id' },
      onDelete: 'CASCADE'
    },

    // Nivel de registro
    nivel: {
      type: DataTypes.ENUM('rutina', 'bloque', 'ejercicio', 'serie'),
      allowNull: false
    },

    // Escala
    escala: {
      type: DataTypes.ENUM('RPE_10', 'BORG_6_20', 'CR10'),
      allowNull: false,
      defaultValue: 'RPE_10'
    },

    // Objetivo vs real
    rpe_objetivo: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      validate: {
        min: 0,
        max: 20
      }
    },
    rpe_real: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      validate: {
        min: 0,
        max: 20
      }
    },

    // Reps in reserve
    rir: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      validate: { min: 0, max: 10 }
    },

    // Para sRPE (minutos de sesión/bloque)
    duracion_min: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      validate: { min: 0, max: 1440 }
    },

    // Señales rápidas
    dolor: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      validate: { min: 0, max: 10 }
    },
    fatiga: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      validate: { min: 0, max: 10 }
    },

    comentarios: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: db.literal('CURRENT_TIMESTAMP')
    },

    created_at: { type: DataTypes.DATE, allowNull: true },
    updated_at: { type: DataTypes.DATE, allowNull: true }
  },
  {
    tableName: 'pse_registros',
    timestamps: false,
    indexes: [
      { fields: ['student_id', 'fecha_registro'] },
      { fields: ['nivel'] },
      { fields: ['rutina_id'] },
      { fields: ['bloque_id'] },
      { fields: ['ejercicio_id'] },
      { fields: ['serie_id'] }
    ],
    validate: {
      // Validación coherencia: según nivel, al menos una FK debe venir
      fkSegunNivel() {
        const n = this.nivel;
        if (n === 'rutina' && !this.rutina_id) {
          throw new Error('Para nivel=rutina debe informarse rutina_id.');
        }
        if (n === 'bloque' && !this.bloque_id) {
          throw new Error('Para nivel=bloque debe informarse bloque_id.');
        }
        if (n === 'ejercicio' && !this.ejercicio_id) {
          throw new Error('Para nivel=ejercicio debe informarse ejercicio_id.');
        }
        if (n === 'serie' && !this.serie_id) {
          throw new Error('Para nivel=serie debe informarse serie_id.');
        }
      },
      // Validación rango por escala (opcionalmente más estricta)
      rangoPorEscala() {
        const { escala, rpe_objetivo, rpe_real } = this;
        const dentro = (val, min, max) =>
          val == null || (val >= min && val <= max);

        if (escala === 'RPE_10') {
          if (!dentro(rpe_objetivo, 0, 10) || !dentro(rpe_real, 0, 10)) {
            throw new Error(
              'Con escala RPE_10, rpe_* debe estar entre 0 y 10.'
            );
          }
        } else if (escala === 'BORG_6_20') {
          if (!dentro(rpe_objetivo, 6, 20) || !dentro(rpe_real, 6, 20)) {
            throw new Error(
              'Con escala BORG_6_20, rpe_* debe estar entre 6 y 20.'
            );
          }
        } else if (escala === 'CR10') {
          if (!dentro(rpe_objetivo, 0, 10) || !dentro(rpe_real, 0, 10)) {
            throw new Error('Con escala CR10, rpe_* debe estar entre 0 y 10.');
          }
        }
      }
    },
    defaultScope: {
      order: [['fecha_registro', 'DESC']]
    },
    scopes: {
      byStudent(studentId) {
        return { where: { student_id: studentId } };
      },
      byNivel(nivel) {
        return { where: { nivel } };
      },
      sesion() {
        return { where: { nivel: 'rutina' } };
      },
      serie() {
        return { where: { nivel: 'serie' } };
      }
    }
  }
);

export default PseRegistrosModel;
