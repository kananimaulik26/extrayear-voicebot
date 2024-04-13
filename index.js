const express = require('express');
const dotEnv = require('dotenv');
const cors = require('cors');
dotEnv.config();

const router = require('./routes');

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", router);

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`server running on PORT :  ${port}`);
})