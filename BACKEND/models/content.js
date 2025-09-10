module.exports = (sequelize, DataTypes) => {
  const Content = sequelize.define('Content', {
    modelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Models',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('video', 'image', 'gallery'),
      allowNull: false,
      defaultValue: 'image',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'broken', 'reported', 'removed'),
      allowNull: false,
      defaultValue: 'active',
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'en',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    timestamps: true,
  });

  Content.associate = function(models) {
    Content.belongsTo(models.Model, {
      foreignKey: 'modelId',
      as: 'model'
    });
    Content.hasMany(models.Report, {
      foreignKey: 'contentId',
      as: 'reports'
    });
    Content.hasMany(models.UserHistory, {
      foreignKey: 'contentId',
      as: 'userHistories'
    });
  };

  return Content;
};