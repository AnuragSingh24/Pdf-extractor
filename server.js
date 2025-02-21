import express from "express";
// import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio"; // Fixed import


import cors from "cors";
import { getDocument } from "pdfjs-dist";

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// POST endpoint to receive the PDF URL
// /////////////////////////////////PDF////////////////////////////////////////
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







// POST endpoint to receive the URL and perform web scraping
// /////////////////////////////////WEB////////////////////////////////////////

// app.post("/scrape-text", async (req, res) => {
//     try {
//         const { url } = req.body;
//         if (!url) {
//             return res.status(400).json({ error: "URL is required" });
//         }

//         // Fetch the HTML content of the provided URL
//         const response = await axios.get(url);
//         const html = response.data;

//         // Load the HTML content into cheerio
//         const $ = cheerio.load(html);

//         // Extract only visible text, excluding scripts, styles, and other non-text elements
//         $("script, style, noscript").remove(); // Remove scripts, styles, and noscript elements
//         let extractedText = "";
        
//         // Optionally, you can refine this to include only specific elements
//         $("p, h1, h2, h3, h4, h5, h6, a, li").each(function() {
//             extractedText += $(this).text().trim() + " "; // Append the text from relevant elements
//         });

//         // Clean up extra spaces and newlines
//         extractedText = extractedText.replace(/\s+/g, " ").trim();

//         // Store the extracted text in a temporary variable (optional)
//         global.extractedText = extractedText;

//         res.json({ message: "Text scraping successful", extractedText });
//     } catch (error) {
//         console.error("Error scraping text:", error);
//         res.status(500).json({ error: "Failed to scrape text from the URL" });
//     }
// });





app.post("/scrape-text", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        // Fetch the HTML content of the provided URL
        const response = await axios.get(url);
        const html = response.data;

        // Load the HTML content into cheerio
        const $ = cheerio.load(html);

        // Extract only visible text, excluding scripts, styles, and other non-text elements
        $("script, style, noscript").remove(); // Remove scripts, styles, and noscript elements
        let extractedText = "";
        
        // Optionally, you can refine this to include only specific elements
        $("p, h1, h2, h3, h4, h5, h6, a, li").each(function() {
            extractedText += $(this).text().trim() + " "; // Append the text from relevant elements
        });

        // Clean up extra spaces and newlines
        extractedText = extractedText.replace(/\s+/g, " ").trim();

        // Split the extracted text into words and limit to 3000 words
        const words = extractedText.split(/\s+/); // Split the text into an array of words
        if (words.length > 3000) {
            extractedText = words.slice(0, 3000).join(" "); // Take the first 3000 words
        }

        // Store the extracted text in a temporary variable (optional)
        global.extractedText = extractedText;

        res.json({ message: "Text scraping successful", extractedText });
    } catch (error) {
        console.error("Error scraping text:", error);
        res.status(500).json({ error: "Failed to scrape text from the URL" });
    }
});



// GET endpoint to retrieve the last scraped text
app.get("/get-text", (req, res) => {
    if (!global.extractedText) {
        return res.status(404).json({ error: "No text available. Scrape first via POST /scrape-text" });
    }
    res.json({ extractedText: global.extractedText });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});