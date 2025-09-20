'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.removeConstraint("users", "users_pkey")
    await queryInterface.removeConstraint("address", "address_pkey")
    await queryInterface.removeConstraint("businessDetails", "businessDetails_pkey")

    await queryInterface.changeColumn("users", "id", {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: true,
      primaryKey: false
    })

    await queryInterface.changeColumn("businessDetails", "id", {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: true,
      primaryKey: false
    })

    await queryInterface.changeColumn("address", "id", {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: true,
      primaryKey: false
    })

    await queryInterface.addConstraint("users", {
      fields: ['id'],
      type: 'primary key',
      name: 'users_pkey'
    });

    await queryInterface.addConstraint("address", {
      fields: ['id'],
      type: 'primary key',
      name: 'address_pkey'
    });

    await queryInterface.addConstraint("businessDetails", {
      fields: ['id'],
      type: 'primary key',
      name: 'businessDetails_pkey'
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn("users", "id", {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    });

    await queryInterface.changeColumn("businessDetails", "id", {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    });

    await queryInterface.changeColumn("address", "id", {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    });
  }
};
