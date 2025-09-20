'use strict';

/** @type {import('sequelize-cli').Migration} */
  module.exports = {
  async up(queryInterface, Sequelize) {
    // Add PASSWORD to existing enum type used by Auth.provider
    // This is idempotent on PG >= 13 using IF NOT EXISTS
    await queryInterface.sequelize.query(`ALTER TYPE "enum_Auth_provider" ADD VALUE IF NOT EXISTS 'PASSWORD';`);
  },

  async down(queryInterface, Sequelize) {
    // No easy way to drop an individual ENUM value in PostgreSQL
    // Intentionally left as a no-op
  }
};


