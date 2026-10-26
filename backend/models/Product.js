const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },

    category: {
      type: DataTypes.ENUM(
        "Clothes",
        "Shoes",
        "Bags",
        "Jewellery",
        "Cosmetics",
        "Household Equipment",
      ),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    imageUrl: {
      type: DataTypes.STRING(2048),
      allowNull: false,
      field: "image_url",
    },

    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
  },
  {
    tableName: "products",
    timestamps: true,

    indexes: [{ fields: ["category"] }, { fields: ["name"] }],
  },
);

module.exports = Product;
