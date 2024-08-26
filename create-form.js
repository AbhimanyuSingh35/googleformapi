const { google } = require("googleapis");
const path = require("path");

async function createForm(title) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, "secret.json"),
      scopes: ["https://www.googleapis.com/auth/forms.body"],
    });

    const client = await auth.getClient();
    const forms = google.forms({ version: "v1", auth: client });

    const newForm = {
      info: {
        title: title,
      },
    };

    const res = await forms.forms.create({
      requestBody: newForm,
    });
    return res.data;
  } catch (error) {
    console.error("Detailed error:", JSON.stringify(error, null, 2));
    throw error;
  }
}

async function getForm(formId) {
  // Implement get form logic
}

async function updateForm(formId, title) {
  // Implement update form logic
}

async function deleteForm(formId) {
  // Implement delete form logic
}

async function lockForm() {}
async function unLockForm() {}

module.exports = { createForm, getForm, updateForm, deleteForm };
