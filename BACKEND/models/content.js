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
    info: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'Contains images count, videos count, and size in bytes'
    }
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
      as: 'histories'
    });
    Content.hasMany(models.Comment, {
      foreignKey: 'contentId',
      as: 'comments'
    });
    Content.hasMany(models.Like, {
      foreignKey: 'contentId',
      as: 'likes'
    });
  };

  return Content;
};