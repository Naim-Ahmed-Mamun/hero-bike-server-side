const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');

const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h3xh8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('HeroBike');
        const productCollection = database.collection('products');
        const reviewCollection = database.collection('reviews');
        const orderCollection = database.collection('orders');
        const userCollection = database.collection('users');
        const blogPostCollection = database.collection('blogPost');

        // get all Products api
        app.get('/allProducts',async(req,res) => {
            const result = await productCollection.find({}).toArray();
            res.json(result)
        })
        // manage all products
        app.get('/manageAllProducts',async(req,res) => {
            const result = await productCollection.find({}).toArray();
            res.json(result)
        })
        // get api
        app.get('/products',async(req,res) => {
            const result = await productCollection.find({}).limit(6).toArray();
            res.json(result)
        })
        // get specific item
        app.get('/product/:id',async(req,res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await productCollection.findOne(query);
            // console.log(result);
            res.json(result)
        })
        // post api
        app.post('/addProduct',async(req,res) => {
            const name = req.body.productName;
            const price = req.body.price;
            const details = req.body.description;
            const image = req.files.image;
            const imageData = image.data;
            const encodedImage = imageData.toString('base64');
            const pictureBuffer = Buffer.from(encodedImage,'base64');
            const product = {
                name,
                price,
                details,
                image: pictureBuffer
            }
            // console.log('body',req.body);
            // console.log('files',req.files);
            const result = await productCollection.insertOne(product);
            res.json(result)
            console.log(result)
        })
        // delete Product
        app.delete('/deleteProduct/:id',async(req,res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const result = await productCollection.deleteOne(query);
            console.log(result)
            res.json(result)
        })
        // review post
        app.post('/review',async(req,res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            // console.log(result)
            res.json(result)
        });
        // review get
        app.get('/review',async(req,res) => {
            const result = await reviewCollection.find({}).toArray();
            res.json(result)
        });
        // all Orders
        app.get('/allOrders',async(req,res) => {
            const result = await orderCollection.find({}).toArray();
            res.json(result)
        })
        // get order email specific item
        app.get('/myOrder/:email',async(req,res) => {
            const email = req.params.email;
            const query = {email:email};
            const result = await orderCollection.find(query).toArray();
            // console.log(result)
            res.json(result)
        })
        // pay product
        /* app.get('/order/payProduct',async(req,res) => {
            const payId = await orderCollection.findOne()
        }) */
        // orders post api
        app.post('/orders',async(req,res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            console.log(result)
            res.json(result)
        });
        // delete order 
        app.delete('/deleteOrder/:id',async(req,res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            res.json(result)
        })
        // Delete Order 
        app.delete('/orderDelete/:id',async(req,res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            res.json(result)
        })
        // update Order
        app.put('/updateOrder/:id',async(req,res) => {
            const id = req.params.id;
            const filter = {_id:ObjectId(id)}
            const orderItem = await orderCollection.findOne(filter);
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                  status:orderItem.status = 'Shipped'
                }
              };
            const result = await orderCollection.updateOne(filter,updateDoc,options);
            // console.log(result)
            res.json(result)
        })
        // check admin
        app.get('/admin/:email',async(req,res) => {
            const email = req.params.email;
            const query = {email:email};
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true
            }
            res.json({admin:isAdmin})
        })
        // user post api
        app.post('/user',async(req,res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            // console.log(result)
            res.json(result)
        })
        // makeAdmin check
        app.put('/makeAdmin/:email',async(req,res) => {
            const email = req.params.email;
            const filter = {email:email};
            const updateDoc = {
                $set:{role:'admin'}
            }
            const result = await userCollection.updateOne(filter,updateDoc);
            // console.log(result)
            res.json(result)
        });
        // get blogPost
        app.get('/blogPost/:title',async(req,res) => {
            const title = req.params.title;
            // console.log(title)
            const query = {blogTitle:title}
            const result = await blogPostCollection.find(query).toArray();
            res.json(result)
        })
        // blogPost
        app.post('/blogPost',async(req,res) => {
            const blogPost = req.body;
            const result = await blogPostCollection.insertOne(blogPost);
            res.json(result)
        })
    }
    finally{
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/',(req,res) => {
    res.send('Hello Hero Bike Server')
});

app.listen(process.env.PORT || 5000,() => {
    console.log('server running',port)
})