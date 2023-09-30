import mongoose from 'mongoose';
export default async function connectDB(){
    try {
        await mongoose.connect(process.env.EMAIL_DATABASE_URL!, {
        });
        console.log(`DB connected`);
      } catch (error) {
        console.error(`DB connection failed: ${error}`);
      }
}