module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    modelId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('content', 'model'),
      allowNull: false,
    },
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'contentId', 'modelId', 'type']
      }
    ]
  });

  Like.associate = function(models) {
    Like.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Like.belongsTo(models.Content, {
      foreignKey: 'contentId',
      as: 'content'
    });
    Like.belongsTo(models.Model, {
      foreignKey: 'modelId',
      as: 'model'
    });
  };

  return Like;
};