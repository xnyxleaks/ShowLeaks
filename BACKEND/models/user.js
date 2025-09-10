module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, 
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'en',
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ageConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'en',
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ageConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      expiredPremium: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    }, {
      timestamps: true,
    });

    User.associate = function(models) {
      User.hasMany(models.Report, {
        foreignKey: 'userId',
        as: 'reports'
      });
      User.hasMany(models.UserHistory, {
        foreignKey: 'userId',
        as: 'histories'
      });
    };
    /*  timestamps: true,
    });

    User.associate = function(models) {
      User.hasMany(models.Report, {
        foreignKey: 'userId',
        as: 'reports'
      });
      User.hasMany(models.UserHistory, {
        foreignKey: 'userId',
        as: 'histories'
      });
    }; */
  
    return User;
  };
  