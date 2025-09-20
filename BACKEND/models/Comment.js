module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    },
    contentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Contents', key: 'id' }, // <-- ajustar
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    modelId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Models', key: 'id' },   // <-- ajustar
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Comments', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'Comments',
    timestamps: true,
  });

  Comment.associate = function(models) {
    Comment.belongsTo(models.User,   { foreignKey: 'userId',   as: 'user' });
    Comment.belongsTo(models.Content,{ foreignKey: 'contentId',as: 'content' });
    Comment.belongsTo(models.Model,  { foreignKey: 'modelId',  as: 'model' });
    Comment.belongsTo(models.Comment,{ foreignKey: 'parentId', as: 'parent' });
    Comment.hasMany(models.Comment,  { foreignKey: 'parentId', as: 'replies' });
    Comment.hasMany(models.CommentLike,{ foreignKey: 'commentId', as: 'commentLikes' });
  };

  return Comment;
};
