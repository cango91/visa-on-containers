import '../src/utilities/config-secrets';
import mongoose from 'mongoose';
import User from '../src/models/user'

declare global {
    var __MONGO_URI__: string;
}

beforeAll(async ()=>{
    await mongoose.connect(global.__MONGO_URI__);
    await User.deleteMany({});
});

afterAll(async ()=>{
    await mongoose.connection.close();
});

describe("User model", ()=>{
    it("should create a user", async()=>{
        const user = await User.create({
            email:"some@email.com",
            password: "securePass1!",
        });
        expect(user).not.toBeNull();
        const foundUser = await User.findOne({});
        expect(foundUser).not.toBeNull();
        expect(foundUser?._id.equals(user._id)).toBeTruthy();
    });
});