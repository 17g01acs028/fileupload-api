// Import required modules
import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import AWS from "aws-sdk"

//import routes
import multerS3 from "multer-s3";

//Middleware
/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));


/* file upload to aws */
const s3 = new AWS.S3()
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'cyclic-cute-tan-indri-hose-eu-central-1',
    key: function (req, file, cb) {
      cb(null, 'uploads/' + file.originalname);
    },
  }),
});



app.post('/upload', upload.single('file'), (req, res) => {
  // Logic to handle successful upload, respond to the client, etc.
  res.status(200).send('File uploaded successfully!');
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`File Upload API running on port ${PORT}`);
});
