import MailSchema from "./model.js";

export const createMail = async (req, res) => {
  const { sender, receiver, type, body, status } = req.body;

  // Log the request body
  console.log("Request Body:", req.body);

  // Validate required fields
  if (!sender || !receiver || !type || !body) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const mail = new MailSchema({
      sender,
      receiver,
      type,
      body,
      status: status || "unseen", // Default to "unseen" if not provided
    });
    await mail.save(); // Save the mail to the database
    res.status(201).json(mail); // Respond with the created mail
  } catch (error) {
    console.error("Error creating mail:", error); // Log the error
    res.status(500).json({ message: "Error creating mail", error });
  }
};

export const getMails = async (req, res) => {
  try {
    const mails = await MailSchema.find();
    res.status(200).json(mails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMail = async (req, res) => {
  const { id } = req.params;
  try {
    await MailSchema.findByIdAndDelete(id); // Added logic to delete mail by ID
    res.status(200).json({ message: "Mail deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting mail", error });
  }
};

export const starMail = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Toggling star for mail with ID: ${id}`); // Log the ID
    const mail = await MailSchema.findById(id);
    if (mail) {
      mail.starred = !mail.starred; // Toggle the 'starred' property
      await mail.save();
      res.status(200).json(mail);
    } else {
      res.status(404).json({ message: "Mail not found" });
    }
  } catch (error) {
    console.error("Error in starMail:", error); // Log the error
    res.status(500).json({ message: "Error starring mail", error });
  }
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const mail = await MailSchema.findById(id); // Find the mail by ID
    if (mail) {
      mail.status = "seen"; // Update the status to "seen"
      await mail.save(); // Save the updated mail
      res.status(200).json({ message: "Mail marked as seen", mail });
    } else {
      res.status(404).json({ message: "Mail not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error marking mail as seen", error });
  }
}; 
