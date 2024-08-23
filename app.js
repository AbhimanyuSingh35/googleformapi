// app.js
require("dotenv").config();
const express = require("express");
const {
  createForm,
  getForm,
  updateForm,
  deleteForm,
} = require("./create-form");

const app = express();
app.use(express.json());

app.post("/forms", async (req, res) => {
  try {
    const { title } = req.body;
    const form = await createForm(title);
    res.json(form);
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ error: "Failed to create form" });
  }
});

app.get("/forms/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await getForm(formId);
    res.json(form);
  } catch (error) {
    console.error("Error getting form:", error);
    res.status(500).json({ error: "Failed to get form" });
  }
});

app.put("/forms/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    const { title } = req.body;
    const form = await updateForm(formId, title);
    res.json(form);
  } catch (error) {
    console.error("Error updating form:", error);
    res.status(500).json({ error: "Failed to update form" });
  }
});

app.delete("/forms/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    await deleteForm(formId);
    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ error: "Failed to delete form" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
