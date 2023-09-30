import { Request, Response, NextFunction } from "express";
import EmailTemplate from "../models/email-template";

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const template = await EmailTemplate.create(req.body);
        res.status(201).json(template);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function updateOne(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id;
        for (let prop in req.body) {
            if (!req.body[prop]) {
                delete req.body[prop];
            }
        }
        const updated = await EmailTemplate.updateOne({ _id: id }, req.body, { new: true });
        res.status(200).json(updated);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) return res.status(404).json({ message: "Template not found" });
        res.status(200).json(template);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const templates = await EmailTemplate.find({});
        res.status(200).json(templates);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function getByName(req: Request, res: Response, next: NextFunction) {
    try {
        const template = await EmailTemplate.findOne({ name: req.query.name });
        if (!template) return res.status(404).json({ message: "Template not found" });
        res.status(200).json(template);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function deleteOne(req: Request, res: Response, next: NextFunction) {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) return res.status(404).json({ message: "Template not found" });
        await template.deleteOne();
        res.status(204).json({});
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}