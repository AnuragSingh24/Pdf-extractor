import express from "express";
import cors from "cors";
import { getDocument } from "pdfjs-dist";

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// POST endpoint to receive the PDF URL
app.post("/extract-text", async (req, res) => {
    try {
        const pdfUrl = req.body.url;
        if (!pdfUrl) {
            return res.status(400).json({ error: "PDF URL is required" });
        }

        const loadingTask = getDocument({ url: pdfUrl });
        const pdf = await loadingTask.promise;
        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText += textContent.items.map(item => item.str).join(" ") + "\n";
        }

        // Store the extracted text in a temporary variable (optional)
        global.extractedText = extractedText;

        res.json({ message: "Text extraction successful", extractedText });
    } catch (error) {
        console.error("Error extracting text:", error);
        res.status(500).json({ error: "Failed to extract text from the PDF" });
    }
});

// GET endpoint to retrieve the last extracted text
app.get("/get-text", (req, res) => {
    if (!global.extractedText) {
        return res.status(404).json({ error: "No text available. Extract first via POST /extract-text" });
    }
    res.json({ extractedText: global.extractedText });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
