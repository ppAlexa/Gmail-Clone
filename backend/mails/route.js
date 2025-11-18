import express from "express";
import { createMail, getMails, starMail, deleteMail, markAsRead } from "./controller.js";

const router = express.Router();

// Route to create a new mail
router.post("/create", createMail);

// Route to get all mails
router.get("/getAll", getMails);

// Route to delete a mail by ID
router.delete("/delete/:id", deleteMail);

// Route to toggle the starred status of a mail
router.put("/star/:id", starMail);

// Route to mark a mail as read
router.put("/read/:id", markAsRead);

export default router;