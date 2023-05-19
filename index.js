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

    // send to data database
    app.post("/addToy", async (req, res) => {
      const body = req.body;
      const result = await allToyCollection.insertOne(body);
      res.send(result)
      console.log(result);

    });

    // server data receive this port
    app.get("/AllToys", async (req, res) => {
      const result = await allToyCollection.find({}).toArray();
      res.send(result);
    });


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