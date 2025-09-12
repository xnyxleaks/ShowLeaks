module.exports = (sequelize, DataTypes) => {
  const CommentLike = sequelize.define('CommentLike', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'commentId']
      }
    ]
  });

  CommentLike.associate = function(models) {
    CommentLike.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    CommentLike.belongsTo(models.Comment, {
      foreignKey: 'commentId',
      as: 'comment'
    });
  };

  return CommentLike;
};