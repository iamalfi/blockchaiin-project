const express = require("express");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const cryptoModel = require("./models/cryptoModel");
const app = express();
app.use(express.json());

// coincap api which is provided by functionup
let url = "https://api.coincap.io/v2/assets";

app.post("/", async (req, res) => {
    // fetching the external api using node-fetch package that is imported above
    // added the header Authorization and its value is the generated api-key as suggested in the coincap api
    const response = await fetch(url, {
        headers: {
            Authorization: "Bearer 1525a0a4-66ba-4532-9448-c63d4ff8eb7a",
        },
    });

    // storing the actual data in result
    const result = await response.json();
    // sorting the fetched data in ascending order using built-in sort method
    const sortedData = result.data.sort(
        (a, b) => a.changePercent24Hr - b.changePercent24Hr
    );
    // inserting the data into db
    for (let i = 0; i < sortedData.length; i++) {
        const { symbol, name, marketCapUsd, priceUsd } = sortedData[i];

        await cryptoModel.findOneAndUpdate(
            { symbol, name },
            { symbol, name, marketCapUsd, priceUsd },
            { upsert: true }
        );
    }
    // sending sorted data as response
    res.json(sortedData);
});

mongoose
    .connect(
        "mongodb+srv://Alfiya:Alfiya%40123@cluster0.gc3lqdx.mongodb.net/?retryWrites=true&w=majority",
        { dbName: "cryptoDB", useNewUrlParser: true }
    )
    .then((result) => {
        console.log("mongodb connected");
    })
    .catch((err) => console.log("error occurred when connecting to mongodb"));
app.listen(4000, () =>
    console.log("server is running at http://localhost:4000")
);
