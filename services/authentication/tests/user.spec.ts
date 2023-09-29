import '../src/utilities/config-secrets';
import mongoose from 'mongoose';
import User from '../src/models/user'

beforeAll(async ()=>{
    await mongoose.connect(global.__MONGO_URI__);
    await User.deleteMany({});
});

afterAll(async ()=>{
    await mongoose.connection.close();
});

