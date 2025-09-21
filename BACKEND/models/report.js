module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
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
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    reason: {
      type: DataTypes.ENUM('broken_link', 'child_content', 'no_consent', 'spam', 'inappropriate', 'other'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  Report.associate = function(models) {
    Report.belongsTo(models.Content, {
      foreignKey: 'contentId',
      as: 'content'
    });
    Report.belongsTo(models.Model, {
      foreignKey: 'modelId',
      as: 'model'
    });
    Report.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Report;
};