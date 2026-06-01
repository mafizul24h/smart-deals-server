const express = require("express");
const cors = require("cors");
// const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


/* const serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
}); */


// Middleware
app.use(cors());
app.use(express.json());

/* const authorization = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    console.log('authHeader');
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    next();
}; */

const logger = (req, res, next) => {
    // console.log(`${req.method} ${req.url}`);
    // console.log('Logger');
    next();
}

/* const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    console.log(token);
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }

    try {
        const userIfo = await admin.auth().verifyIdToken(token);
        console.log(userIfo);
        req.token_email = userIfo.email;
        next();
    } catch (error) {
        console.log(error);
        return res.status(403).send({ message: 'Forbidden access' });
    }
}; */

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.user = decoded;
        // console.log('Decoded JWT:', decoded);
        next();
    });
};

// app.use(logger);
// app.use(verifyToken);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k95s6zq.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get("/", (req, res) => {
    res.send("Smart server is running");
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const productsCollection = client.db("smartMealDB").collection("products");
        const bidesCollection = client.db("smartMealDB").collection("bids");
        const usersCollection = client.db("smartMealDB").collection("users");

        app.post("/jwt", async (req, res) => {
            const user = req.body;
            // console.log(user);
            /* const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            } */
            const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.send({ token: token });
        })

        app.get("/products", async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                query.email = email
            }
            const result = await productsCollection.find(query).sort({ created_at: -1 }).toArray();
            res.send(result)
        })

        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result)
        })

        app.get("/latest-products", async (req, res) => {
            const result = await productsCollection.find({}).sort({ created_at: -1 }).limit(6).toArray();
            res.send(result);
        });

        app.get("/my-products", verifyJWT, async (req, res) => {
            const email = req.query.email;
            // console.log('Headers', req.user.email);
            const query = {};
            if (email) {
                query.email = email
                // console.log('Query email', query.email);
            }
            if (email !== req.user.email) {
                return res.status(403).send({ message: 'Forbidden access' });
            }
            const result = await productsCollection.find(query).sort({ created_at: -1 }).toArray();
            res.send(result);
        })

        /* app.post("/products", async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result)
        }) */

        app.post("/products", verifyJWT, async (req, res) => {
            try {
                const product = req.body;

                const result = await productsCollection.insertOne(product);

                res.status(201).send(result);
            } catch (error) {
                console.log(error);

                res.status(500).send({
                    success: false,
                    message: "Failed to add product",
                });
            }
        });

        app.patch("/product/:id", verifyJWT, async (req, res) => {
            const id = req.params.id;
            const product = req.body;
            const query = { _id: new ObjectId(id) };
            const updateProduct = {
                $set: { ...product }
            }
            const result = await productsCollection.updateOne(query, updateProduct);
            res.send(result);
        })

        app.delete("/product/:id", verifyJWT, async (req, res) => {
            const id = req.params.id; 
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })

        // Bids Collections
        /* app.get("/bids", logger, verifyToken, async (req, res) => {
            // console.log('Headers', req);
            const email = req.query.email;
            const query = {};
            if (email) {
                if (email !== req.token_email) {
                    return res.status(403).send({ message: 'Forbidden access' });
                }
                query.buyer_email = email
            }
            const result = await bidesCollection.find(query).toArray();
            res.send(result);
        }) */

        app.get("/bids", verifyJWT, async (req, res) => {
            // console.log('Headers', req.user.email);
            const email = req.query.email;
            const query = {};
            if (email) {
                query.buyer_email = email
            }

            if (email !== req.user.email) {
                return res.status(403).send({ message: 'Forbidden access' });
            }

            const result = await bidesCollection.find(query).toArray();
            res.send(result);
        })

        app.get("/bids/:productId", verifyJWT, async (req, res) => {
            const productId = req.params.productId;
            const query = { product_id: productId };
            const result = await bidesCollection.find(query).sort({ offer_price: -1 }).toArray();
            res.send(result);
        })

        app.post("/bids", async (req, res) => {
            const newBides = req.body;
            const result = await bidesCollection.insertOne(newBides);
            res.send(result);
        })

        app.delete("/bids/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bidesCollection.deleteOne(query);
            res.send(result);
        })

        // User Collections
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find({}).toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const email = req.body.email;
            const query = { email: email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                res.send({ message: 'User already have in db' });
            } else {
                const result = await usersCollection.insertOne(user);
                res.send(result);
            }
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir)


app.listen(port, () => {
    console.log(`Smart server is running port ${port}`);
})

/* client.connect()
    .then(() => {
        app.listen(port, () => {
            console.log(`Smart server is running port ${port}`);
        })
    })
    .catch(console.dir) */
// How to create a random secret key in node js
/* const crypto = require("crypto");

const secret = crypto.randomBytes(64).toString("hex");

console.log(secret); */