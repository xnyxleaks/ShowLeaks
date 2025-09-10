module.exports = (sequelize, DataTypes) => {
  const UserHistory = sequelize.define('UserHistory', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    contentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Contents',
        key: 'id'
      }
    },
    modelId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Models',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.ENUM('view', 'like', 'share', 'download'),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  UserHistory.associate = function(models) {
    UserHistory.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    UserHistory.belongsTo(models.Content, {
      foreignKey: 'contentId',
      as: 'content'
    });
    UserHistory.belongsTo(models.Model, {
      foreignKey: 'modelId',
      as: 'model'
    });
  };

  return UserHistory;
};