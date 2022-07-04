const Mongoose = require("mongoose");
const amdr = require("./AMD-R");

const dataSchema = new Mongoose.Schema({
  gps: {
    lon: {
      type: Number,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
  },
  battery: {
    type: Number,
    required: true,
  },
  speed: {
    type: Number,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  Time: {
    type: Date,
    default: Date.now(),
    required: true,
    unique: true,
  },
}, {
  // https://stackoverflow.com/questions/70717856/how-to-create-time-series-collection-with-mongoose
  // https://mongoosejs.com/docs/guide.html#timeseries
  timeseries: {
    timeField: 'Time',
    granularity: 'seconds',
  },
  expireAfterSeconds: 3600,
});

// Exporting Models (Unused because it doesn't include new amd-rs)
// const models = {};
// const promise = new Promise((resolve, reject) => {
//   amdr.find({}).then((amdrs) => {
//     amdrs.forEach((amdr) => {
//       const id = amdr._id.toString()
//       models[id] = Mongoose.model(id, dataSchema, id)
//     })
//     resolve(models)
//   })
// });
module.exports = dataSchema;
