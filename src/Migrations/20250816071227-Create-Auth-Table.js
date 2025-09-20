'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Auth', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      provider: {
        type: Sequelize.ENUM('GOOGLE', 'FACEBOOK', 'APPLE', 'PASSWORD'),
        allowNull: false,
      },
      providerId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      accessToken: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      refreshToken: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sessionToken: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sessionExpiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      tokenExpiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // ✅ Indexes
    await queryInterface.addIndex('Auth', ['provider', 'providerId', "userId"], {
      unique: true,
      name: 'auth_provider_providerId_unique',
    });


    await queryInterface.addIndex('Auth', ['userId']);

    await queryInterface.removeColumn("users", "password")
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Auth');

    await queryInterface.addColumn("users", "password", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },


};
