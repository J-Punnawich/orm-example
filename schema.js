const { Sequelize, DataTypes, Model } = require("sequelize");

const sequelize = new Sequelize("tutorial", "root", "root",
   {
      host: "localhost",
      dialect: "mysql",
   }
)

const User = sequelize.define("users", {
   name: {
      type: DataTypes.STRING,
      allowNull: false,
   },
   email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
   }
})

const Address = sequelize.define("addresses", {
   address1: {
      type: DataTypes.STRING,
      allowNull: false,
   },
   country: {
      type: DataTypes.STRING,
      allowNull: false
   },
   zip: {
      type: DataTypes.INTEGER,
      allowNull: true, 
   },
})


// Relation แบบ ปกติ
// User.hasMany(Address)

// Relation แบบ ผูกติด (สามารถลบไปพร้อมกันได้) ในบางกรณี
User.hasMany(Address, { onDelete: 'CASCADE' })


Address.belongsTo(User)

module.exports = {
   User,
   Address,
   sequelize
}
