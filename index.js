const express = require('express')
const  app = express()
const dotenv = require('dotenv').config();
const Port = process.env.PORT || 5000

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

app.listen(Port, () =>{
    console.log(`Server is running on ${Port}`)
})