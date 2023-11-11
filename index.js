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
const upload = multer();



app.post('/upload', upload.array('certificates'), (req, res) => {
  const files = req.files;

  const uploadPromises = files.map(file => {
    // Parameters for uploading file to S3
    const params = {
      Bucket: process.env.BUCKET,
      Key: file.originalname, // File name in S3
      Body: file.buffer // Actual file content
    };

    return s3.upload(params).promise();
  });

  Promise.all(uploadPromises)
    .then(data => {
      res.json({ message: 'Files uploaded successfully', data });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

app.get('/api/questions/response/download/:filename', (req, res) => {
  const fileName = req.params.filename;

  // Parameters for downloading file from S3
  const params = {
    Bucket: 'process.env.BUCKET',
    Key: fileName // File name in S3
  };

  // Get object from S3
  s3.getObject(params, (err, data) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`); // Forces the browser to download the file
      res.send(data.Body);
    }
  });
});


const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`File Upload API running on port ${PORT}`);
});
