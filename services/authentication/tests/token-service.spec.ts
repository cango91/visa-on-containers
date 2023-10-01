import '../src/utilities/config-secrets';
import mongoose from "mongoose";
import User from "../src/models/user";
import RefreshToken from '../src/models/refresh-token';
import redisClient from '../src/utilities/config-redis';

declare global {
    var __MONGO_URI__: string;
}

beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
    await redisClient.disconnect();
});

beforeEach(async()=>{
    await RefreshToken.deleteMany({});
});

describe("Token Service", () => {
    it("should create jwt and refresh tokens", async () => {
        
    });
})