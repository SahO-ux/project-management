import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URL;
  if (!uri) throw new Error("MONGODB_URL not set in env");

  await mongoose.connect(uri);
  console.log("⚡⚡ MongoDB Connected ⚡⚡");
};

export default connectDB;
