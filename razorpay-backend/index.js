require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const serviceAccount = require("./car-app-b8390-firebase-adminsdk-fbsvc-84dc30fcc9.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("✅ ParkSmart Backend Running");
});

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    console.log("✅ Order Created:", order.id);

    res.json(order);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
});

app.post("/payment-info", async (req, res) => {
  try {
    const payment = req.body;

    const docRef = await db.collection("payments").add({
      ...payment,
      status: "Paid",
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log("✅ Payment Saved:", docRef.id);

    res.json({
      success: true,
      id: docRef.id,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to save payment",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend Running on http://localhost:${PORT}`);
});
