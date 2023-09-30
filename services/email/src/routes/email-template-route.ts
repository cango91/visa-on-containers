import { Router } from "express";
import { create, deleteOne, getAll, getOne, updateOne } from "../controllers/email-template-controller";

const router = Router();

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', updateOne);
router.delete('/:id', deleteOne);

export default router;