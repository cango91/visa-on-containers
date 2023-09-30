import mongoose from "mongoose";
import EmailTemplate from '../src/models/email-template';

declare global {
    var __MONGO_URI__: string;
}

beforeAll(async ()=>{
    await mongoose.connect(global.__MONGO_URI__);
});

afterAll(async ()=>{
    await mongoose.connection.close();
});

beforeEach(async ()=>{
    await EmailTemplate.deleteMany({});
})

describe("EmailTemplate Schema", () => {
  
    describe("Schema Validation", () => {
      
      it("should validate a correct schema", async () => {
        const template = new EmailTemplate({
          name: 'TestTemplate',
          subject: 'Test Subject',
          body: 'Hello, $__username',
          variables: ['$__username']
        });
  
        await expect(template.save()).resolves.toBeTruthy();
      });
      
      it("should invalidate an incorrect schema", async () => {
        const template = new EmailTemplate({
          subject: 'Test Subject',
          body: 'Hello, world'
        });
  
        await expect(template.save()).rejects.toBeTruthy();
      });
  
    });
  
    describe("Middleware Logic", () => {
      
      it("should correctly validate variables", async () => {
        const template = new EmailTemplate({
          name: 'TestTemplate',
          subject: 'Test Subject',
          body: 'Hello, $__username',
          variables: ['$__username']
        });
  
        await expect(template.save()).resolves.toBeTruthy();
      });
  
      it("should throw error for incorrect variable names", async () => {
        const template = new EmailTemplate({
          name: 'TestTemplate',
          subject: 'Test Subject',
          body: 'Hello, $__username',
          variables: ['username']
        });
  
        await expect(template.save()).rejects.toBeTruthy();
      });
  
      it("should throw error for missing variables in the email body", async () => {
        const template = new EmailTemplate({
          name: 'TestTemplate',
          subject: 'Test Subject',
          body: 'Hello, world',
          variables: ['$__username']
        });
  
        await expect(template.save()).rejects.toBeTruthy();
      });
  
      it("should handle variables with regex-meaningful characters correctly", async () => {
        const template = new EmailTemplate({
          name: 'TestTemplate',
          subject: 'Test Subject',
          body: 'Hello, $__user\\.name',
          variables: ['$__user\\.name']
        });
  
        await expect(template.save()).resolves.toBeTruthy();
      });
      
    });
  });