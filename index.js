import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'
import Razorpay from 'razorpay';
import router from './routers/paymentRoute.js';
import { config } from 'dotenv';

config();
const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());
app.use(cors({
    origin: 'https://keshavindustries.netlify.app', // Specify your frontend origin
    methods: 'GET,POST,PUT,DELETE', // Specify the allowed methods
    credentials:false,
    allowedHeaders: 'Content-Type, Authorization', // Specify allowed headers
}));


app.use("/api", router);
app.get('/', (req, res) => {
    res.send("Hello World!");
})

app.post('/orders', async(req, res) => {
    const razorpay = new Razorpay({
        key_id: process.env.API_KEY,
        key_secret: process.env.API_SECRET
    })

    const options = {
        amount: req.body.amount,
        currency: req.body.currency,
        receipt: "receipt#1",
        payment_capture: 1
    }

    try {
        const response = await razorpay.orders.create(options)
        if(response.id){
            res.json({
                order_id: response.id,
                currency: response.currency,
                amount: response.amount
            })    
        }
        else{
            res.json({message:"order Creation failed"});
        }

    } catch (error) {
        res.status(500).send("Internal server error")
    }
})

app.get("/payment/:paymentId", async(req, res) => {
    const {paymentId} = req.params;
    // console.log("worked", paymentId);

    const razorpay = new Razorpay({
        key_id: "rzp_live_w1F1WlXsmUUQMN",
        key_secret: "0lYodF8TSI555KvCZgT3nnbs"
    })
    console.log(razorpay)
    
    try {
        const payment = await razorpay.payments.fetch(paymentId)
        console.log(payment)

        if (!payment){
            return res.status(500).json("Error at razorpay loading")
        }

        res.json({
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency
        })
    } catch(error) {
        res.status(500).json("failed to fetch")
    }
})


app.listen(port, () => {
    console.log(`server is running on ${port}`);
})