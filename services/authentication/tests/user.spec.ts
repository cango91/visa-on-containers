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
    it("should create a user with email and password", async()=>{
        const user = await User.create({
            email:"some@email.com",
            password: "securePass1!",
        });
        expect(user).not.toBeNull();
        const foundUser = await User.findOne({});
        expect(foundUser).not.toBeNull();
        expect(foundUser?._id.equals(user._id)).toBeTruthy();
    });

    it("should create a user with email and googleId", async()=>{
        const user = await User.create({
            email: "some@other.com",
            googleId: "SomeGoogleId"
        });
        expect(user).not.toBeNull();
        const foundUser = await User.findOne({email: "some@other.com"});
        expect(foundUser).not.toBeNull();
        expect(foundUser?._id.equals(user._id)).toBeTruthy();
    });

    it("should not create a user without either password or googleId", async()=>{
        try {
            await User.create({
                email: 'new@email.com'
            });
            fail("Should've thrown an error");
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    it("should check password correctly", async()=>{
        const foundUser = await User.findOne({
            email: 'some@email.com'
        });
        const check1 = await foundUser?.checkPassword("securePass1!");
        const check2 = await foundUser?.checkPassword("securePass2!");
        expect(check1).toBeTruthy();
        expect(check2).toBeFalsy();
    })
});