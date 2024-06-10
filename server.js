const express = require("express")
const mysql = require("mysql2/promise");

const { User, Address, sequelize } = require("./schema");
const { where } = require("sequelize");


let conn = null;

// function init connection mysql
const initMySQL = async () => {
   conn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "tutorial",
   });
};

const app = express();

app.use(express.json())
const port = 8000;

app.get('/api/users', async (req, res) => {
   try {

      const users = await User.findAll()
      res.json(users)
   } catch (err) {
      res.status(404).json(err)
   }
})

// find list address of userId
app.get('/api/users/:id/address', async (req, res) => {
   const userId = req.params.id
   try {
      // const [result] = await conn.query
      // (`SELECT users.*, addresses.* from users 
      //    JOIN addresses on users.id = addresses.userId
      //    WHERE users.id = ?`, userId)

      const result = await User.findOne({
         where: { id: userId },
         include: {
            model: Address
         }
      })
      res.json(result)
   } catch (err) {
      console.log(err)
      res.status(404).json({
         message: 'find error',
         errors: err
      })
   }
})

app.post('/api/users', async (req, res) => {
   const userData = req.body;

   try {
      // old way
      // userData.createdAt = new Date()
      // userData.updatedAt = new Date()
      // const [result] = await conn.query('INSERT INTO users SET ?', userData)

      const user = await User.create(userData)

      const addressData = userData.addresses

      let addressCreated = []
      for (let i = 0; i < addressData.length; i++) {
         const caddressData = addressData[i];
         caddressData.userId = user.id
         const addr = await Address.create(caddressData)

         addressCreated.push(addr)
      }

      res.json({
         user,
         addresses: addressCreated
      });

   } catch (err) {
      console.log(err)
      res.status(500).json({
         message: 'create error',
         error: err.errors.map((e) => e.message),
      })
   }
})

// update user data
app.put('/api/users/:id', async (req, res) => {
   const userData = req.body
   const userId = req.params.id
   try {
      // case 1: update old way
      // const [user] = await conn.query('UPDATE users SET ? WHERE users.id = ?', [data, userId])

      // case 2: update 1 address
      // const user = await User.update(
      //    { name: 'help me' },
      //    { where: { id: userId} }
      // )

      // case 3: update userData, list of address
      const users = await User.update(
         {
            name: userData.name,
            email: userData.email
         },
         { where: { id: userId } }
      )

      const addressData = userData.addresses

      let addressCreated = []
      for (let i = 0; i < addressData.length; i++) {
         const caddressData = addressData[i];
         caddressData.userId = userId
         const addr = await Address.upsert(caddressData)  // upsert = ถ้ามีก้อัพเดท ถ้าไม่มีสร้างใหม่เลย
                                                         // ใน req ต้องมี id ของ address ทีจะอัพเดทด้วย ฝๅๅๅ
         addressCreated.push(addr)
      }

      res.json({
         users
      })
   } catch (err) {
      console.log(err)
      res.status(404).json({
         message: 'update error',
         errors: err
      })
   }
})


app.listen(port, async () => {
   await initMySQL()
   await sequelize.sync()  // use { force: true } in case sql not exercute !! จะทำการล้าง DB

   console.log(`Running on ${port}`)
})