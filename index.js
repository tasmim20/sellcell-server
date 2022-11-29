const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const app = express();

// middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.izqajim.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const productCollection = client.db('productSell').collection('products');
        const bookingsCollection = client.db('productSell').collection('bookings');
        
        app.get('/products', async(req, res) =>{
            const query = {}
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })
        
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await productCollection.findOne(query);
            res.send(service);
        });

        
        app.get('/bookings',  async(req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })
           

        // app.get('/bookings', async(req, res) =>{
        //         const query = {};
        //         const cursor = bookingsCollection.find(query);
        //         const bookings = await cursor.toArray();
        //         res.send(bookings);
        // })
           
        app.get('/jwt', async(req, res) =>{
            const email = req.query.email;
            const query = {email: email};
            const booking = await bookingsCollection.findOne(query);
            if(booking){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
                return res.send({accessToken: token})
            }
            // console.log(booking);

        })

        app.post('/bookings', async(req, res) =>{
            const booking = req.body;
            console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(error => console.log(error));

app.get('/', async(req,res) =>{
    res.send('sell cell server is running');
})

app.listen(port, () => console.log(`sell cell server running on ${port}`))