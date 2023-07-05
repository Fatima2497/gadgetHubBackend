const express = require('express')
const  app = express()
const dotenv = require('dotenv').config();
const Port = process.env.PORT || 5000
const AWS = require("aws-sdk");
const s3 = new AWS.S3()

const dbConnect = require('./config/dbConn')
dbConnect()

const authRouter = require('./routes/authRoute');
const bodyParser = require('body-parser');
const { notfound, errorHandler } = require('./middleware/errorHandling');
const cookieParser = require('cookie-parser');

const productRouter = require('./routes/productRoute')
const blogRouter = require('./routes/blogRoute')
const categoryRouter = require('./routes/procategoryRoute')
const blogcategoryRouter = require('./routes/blogcatRoute')
const brandRouter = require('./routes/brandRoute')
const colorRouter = require('./routes/colorRoute')
const couponRouter = require('./routes/couponRoute')
const enqRouter = require('./routes/enqRoute')
const uploadRouter = require('./routes/uploadRoute')
const morgan = require("morgan")
const cors = require('cors')

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieParser())

app.use('/api/user', authRouter)
app.use('/api/product', productRouter)
app.use('/api/blog', blogRouter)
app.use('/api/prodcat', categoryRouter)
app.use('/api/blogcat', blogcategoryRouter)
app.use('/api/brand', brandRouter)
app.use('/api/coupon', couponRouter)
app.use('/api/color', colorRouter)
app.use('/api/enquiry', enqRouter)
app.use('/api/upload', uploadRouter)

app.use(notfound)
app.use(errorHandler)



AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  });

const getObjectFromS3 = async () => {
    try {
      const params = {
        Bucket: "cyclic-funny-pink-suit-eu-west-2",
        Key: "some_files/my_file.json",
      };
  
      const response = await s3.getObject(params).promise();
      const content = response.Body.toString("utf-8");
      const parsedContent = JSON.parse(content);
  
      console.log(parsedContent);
    } catch (error) {
      console.error("Error retrieving object from S3:", error);
    }
  };
  
  getObjectFromS3();




app.listen(Port, () =>{
    console.log(`Server is running on ${Port}`)
})