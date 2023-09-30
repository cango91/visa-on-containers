import { Router } from "express";
import { sendEmail } from "../controllers/send-email-controller";

const router = Router();

router.post('/send', sendEmail);

export default router;