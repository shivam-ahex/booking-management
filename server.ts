import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("./config.env") });
import app from "./app";

const DB = process.env.DATABASE?.replace(
  '<password>',
  String(process.env.DATABASE_PASSWORD)
)|| '';

const port = process.env.PORT || 3000;
 
 mongoose.connect(DB).then(() => console.log("DB connected"));

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});



