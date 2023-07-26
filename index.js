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


function verifyJWT(req, res, next){
    console.log('token inside VerifyJWT', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.send(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];
}
async function run(){
    try{
        const productCollection = client.db('productSell').collection('products');
        const bookingsCollection = client.db('productSell').collection('bookings');
        const usersCollection = client.db('productSell').collection('users');
        
        app.get('/products', async(req, res) =>{
            const query = {}
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })
        
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('token', req.headers.authorization);
            const query = { _id: ObjectId(id) };
            const service = await productCollection.findOne(query);
            res.send(service);
        });

        
        app.get('/bookings', verifyJWT, async(req, res) => {
            const email = req.query.email;
            // console.log('token', req.headers.authorization);
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })
           


        app.post('/bookings', async(req, res) =>{
            const booking = req.body;
            console.log(booking);
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })


        app.get('/jwt', async(req, res) =>{
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
                return res.send({accessToken: token});
            }
            console.log(user);
            res.status(403).send({accessToken: ''})


        })

        app.get('/users', async(req, res) =>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        app.get('/users/admin/:email', async(req, res) =>{
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'})
        })

      //post users email
      app.post('/users', async(req, res) =>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);

      })

      app.put('/users/admin/:id',verifyJWT, async(req, res)=>{
        const decodedEmail = req.decoded.email;
        const query = await usersCollection.findOne(express.query);
        if(user?.role !== 'admin'){
            return res.status(403).send({message:'forbidden access'})
        }
        const id = req.params.id;
        const filter = {_id: ObjectId(id)}
        const options = {upsert: true};
        const updatedDoc = {
            $set: {
                role: 'admin'
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc, options);
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