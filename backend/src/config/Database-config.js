import mongoose  from "mongoose";
import { DB_NAME } from "../../constants.js";

const connectDB = async ()=>{
    try {
        const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
        const connectionInstance = await mongoose.connect(`${mongoUri}/${DB_NAME}`)
        console.log('database connected  ',connectionInstance.connection.host);
        
    } catch (error) {
        console.log('error occured ',error);
        process.exit(1)
        
        
    }
}

export default connectDB;