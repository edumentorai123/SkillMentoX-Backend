import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI?.replace(/^["']|["']$/g, "");
    const conn = await mongoose.connect(mongoUri);
    console.log("MongoDB Connected Successfully");
    console.log(`Database in use: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;