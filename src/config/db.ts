import mongoose from 'mongoose';

const MONGO_URI: string | undefined = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI is not defined in the environment variables');

const connectDb = async () => {
  console.log('Connecting to Mongodb');
  await mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('Mongodb Connencted');
    })
    .catch(() => {
      console.log('Unable to Connect to Mongodb');
      process.exit(-1);
    });
};

export default connectDb;
