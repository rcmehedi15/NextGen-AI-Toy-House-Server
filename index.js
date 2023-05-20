const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// connect mongodb


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mehedi15.lrak9tg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db('ToyHouse');
    const allToyCollection = db.collection('AllToys');

    // 1. send to data database
    app.post("/addToy", async (req, res) => {
      const body = req.body;
      const result = await allToyCollection.insertOne(body);
      res.send(result)
      console.log(result);

    });

    // 2. server data receive this port
    app.get("/AllToys/:text", async (req, res) => {
      console.log(req.params.text);
      if (req.params.text == "Men Robotics" || req.params.text == "Women Robotics" || req.params.text == "Kids Robotics") {
        const result = await allToyCollection
          .find({ subCategory: req.params.text })
          .toArray();
        console.log(result);
        return res.send(result)
      }
      const result = await allToyCollection.find({}).toArray();
      res.send(result);
    });
    //  3. my toy table data show 
    app.get("/myToys/:email", async (req, res) => {
      const result = await allToyCollection.find({ sellerEmail: req.params.email }).toArray();
      res.send(result)
      console.log(req.params.email);
    })


    // 4. all toys search box 

    const indexKeys = { toyName: 1 };
    const indexOptions = { name: "toyName" }
    const result = await allToyCollection.createIndex(indexKeys,indexOptions);

    app.get("/toySearchByTitle/:text", async(req, res) => {
      const searchText = req.params.text;
      const result = await allToyCollection.find({ toyName: { $regex: searchText, $options: "i" }}).toArray()
      res.send(result)
    })



      // Send a ping to confirm a successful connection

      console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Mehedi Now busy')
})

app.listen(port, () => {
  console.log(`NextGen server is running on port: ${port}`);
})