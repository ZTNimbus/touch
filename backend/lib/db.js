import mongoose from "mongoose";

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected:", conn.connection.host);
  } catch (error) {
    console.log("MongoDB Connection Error:", error);
  }
}

export { connectDB };
