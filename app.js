const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const Store = require("./api/models/store");
const GoogleMapsService = require('./api/services/googleMapsService');
const googleMapsService = new GoogleMapsService();
require('dotenv').config();

mongoose.connect(
  "mongodb+srv://ye_24:abcd1234@cluster0.mswxf.mongodb.net/<dbname>?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
);


app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/api/stores", (req, res) => {
  const zipCode = req.query.zip_code;
  googleMapsService.getCoordinates(zipCode).then(coordinates => {
      Store.find(
        {
          location: {
            $near: {
              $maxDistance: 3218,
              $geometry: {
                type: "Point",
                coordinates: coordinates
              }
            }
          }
        },
        (err, stores) => {
          if (err) {
            res.status(500).send("err");
          } else {
            res.status(200).send(stores);
          }
        }
      );
    })
    .catch(err => {
      console.log(err);
    });
});

app.post("/api/stores", (req, res) => {
  let dbStores = [];
  let stores = req.body;
  stores.forEach(store => {
    dbStores.push({
      storeName: store.name,
      phoneNumber: store.phoneNumber,
      address: store.address,
      openStatusText: store.openStatusText,
      addressLines: store.addressLines,
      location: {
        type: "Point",
        coordinates: [store.coordinates.longitude, store.coordinates.latitude]
      }
    });
  });
  Store.create(dbStores, (err, stores) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(stores);
    }
  });
});

app.delete("/api/stores", (req, res) => {
  Store.deleteMany({}, err => {
    res.status(200).send(err);
  });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
