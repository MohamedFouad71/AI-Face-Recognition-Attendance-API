import mongoose from 'mongoose';

const MONGO_URI: string | undefined = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI is not defined in the environment variables');

const connectDb = async () => {
  await mongoose
    .connect(MONGO_URI || 'http://localhost:27017')
    .then(() => {
      console.log('Mongodb Connencted');
    })
    .catch(() => {
      console.log('Unable to Connect to Mongodb');
      process.exit(-1);
    });
};

export default connectDb;
