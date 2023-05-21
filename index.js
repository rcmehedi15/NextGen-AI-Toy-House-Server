const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()
const app = express();
const port = process.env.PORT || 5001;

// middleware
app.use(cors());
app.use(express.json());

// connect mongodb

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

    // find all data 
    app.get('/toys',async(req,res) => {
     const limit = parseInt(req.query.limit)
      const result = await allToyCollection.find().limit(limit).toArray()
      res.send(result);
    })
    app.get('/toys/:id',async(req,res) => {
      console.log(req.params.id);
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await allToyCollection.findOne(query)
      res.send(result)
      
    })
    //  edit data 
    app.put('/toys/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedToy = req.body;

      const Toy = {
        $set: {
          Price: updatedToy.Price,
          availableQuantity: updatedToy.availableQuantity,
          detailDescription: updatedToy.detailDescription,
        }
      }

      const result = await allToyCollection.updateOne(filter, Toy, options);
      res.send(result);
    })

    // 2. server data receive this port
    app.get("/AllToys/:text", async (req, res) => {
      console.log(req.params.text);
      if (req.params.text == "Men Robotics" || req.params.text == "Women Robotics" || req.params.text == "Kids Robotics") {
        const result = await allToyCollection
          .find({ subCategory: req.params.text })
          .toArray();
        // console.log(result);
        return res.send(result)
      }
      const result = await allToyCollection.find({}).toArray();
      res.send(result);
    });
    //  3. my toy table data show 


    app.get('/myToys', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email }
      }
      const result = await allToyCollection.find(query).toArray();
      res.send(result);
    })

    // 4. all toys search box 

    const indexKeys = { toyName: 1 };
    const indexOptions = { name: "toyName" }
    const result = await allToyCollection.createIndex(indexKeys, indexOptions);

    app.get("/toySearchByTitle/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await allToyCollection.find({ toyName: { $regex: searchText, $options: "i" } }).toArray()
      res.send(result)
    })

    //  4 delete data form server

    app.delete('/myToys/:id', async (req, res) => {
      console.log(req.params.id);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await allToyCollection.deleteOne(query);
      res.send(result);


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