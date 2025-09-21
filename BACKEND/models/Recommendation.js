module.exports = (sequelize, DataTypes) => {
  const Recommendation = sequelize.define('Recommendation', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    modelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Models',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
  }, {
    timestamps: true,
  });

  Recommendation.associate = function(models) {
    Recommendation.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Recommendation.belongsTo(models.Model, {
      foreignKey: 'modelId',
      as: 'model'
    });
    Recommendation.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer'
    });
  };

  return Recommendation;
};