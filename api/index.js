const express = require('express');
const dotEnv = require('dotenv');
const cors = require('cors');
dotEnv.config();

const router = require('./routes');

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", router);

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));