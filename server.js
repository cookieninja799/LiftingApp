require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");

const { OPENAI_API_KEY, ASSISTANT_ID, PORT } = process.env;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// Create an Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const assistantId = ASSISTANT_ID;
let pollingInterval;

// Create a thread
async function createThread() {
    console.log("Creating a new thread...");
    const thread = await openai.beta.threads.create();
    return thread;
}

// Add a message to a thread
async function addMessage(threadId, message) {
    console.log("Adding a message to thread: " + threadId);
    const response = await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
    });
    return response;
}

async function runAssistant(threadId) {
    try {
        console.log("Running assistant for thread:", threadId);
        const response = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId,
            temperature: 0.5, // Adjusted for stability
        });
        return response;
    } catch (error) {
        if (error.response) {
            // Log the full error response for better visibility
            console.error("Assistant run failed. Full error response:", error.response.data);
        } else if (error.request) {
            // Log issues with the request (e.g., network problems)
            console.error("Assistant run failed. Request issue:", error.request);
        } else {
            // General errors
            console.error("Assistant run failed. Error message:", error.message);
        }
        throw error; // Re-throw the error for higher-level handling
    }
}

// Check status of a run and respond to client
async function checkingStatus(res, threadId, runId, responseSent) {
    if (responseSent.value) return; // Skip if a response has already been sent

    try {
        const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
        const status = runObject.status;
        console.log("Current status:", status);

        if (status === "completed") {
            clearInterval(pollingInterval);
            try {
                const messagesList = await openai.beta.threads.messages.list(threadId);
                const messages = messagesList.body.data.map((message) => message.content);

                if (!responseSent.value) {
                    responseSent.value = true;
                    res.json({ messages });
                }
            } catch (error) {
                console.error("Error retrieving messages:", error.response?.data || error.message);
                if (!responseSent.value) {
                    responseSent.value = true;
                    res.status(500).json({ error: "Failed to retrieve messages." });
                }
            }
        } else if (status === "failed" || status === "cancelled") {
            clearInterval(pollingInterval);
            console.error(`Run ${status}.`);
            if (!responseSent.value) {
                responseSent.value = true;
                res.status(500).json({ error: `Run ${status}. Please try again.` });
            }
        }
        // Continue polling for other statuses (e.g., in_progress, queued)
    } catch (error) {
        clearInterval(pollingInterval);
        console.error("Error checking run status:", error.response?.data || error.message);
        if (!responseSent.value) {
            responseSent.value = true;
            res.status(500).json({ error: "Failed to check run status." });
        }
    }
}

//=========================================================
//==================== ROUTES =============================
//=========================================================

// Route to create a new thread
app.get("/thread", async (req, res) => {
    try {
        const thread = await createThread();
        res.json({ threadId: thread.id });
    } catch (error) {
        console.error("Failed to create thread:", error);
        res.status(500).json({ error: "Failed to create thread" });
    }
});

// Route to add a message and run assistant
app.post("/message", async (req, res) => {
    const { message, threadId } = req.body;
    const responseSent = { value: false }; // Track whether a response has been sent

    try {
        const messageResponse = await addMessage(threadId, message);
        const run = await runAssistant(threadId);
        const runId = run.id;

        pollingInterval = setInterval(async () => {
            await checkingStatus(res, threadId, runId, responseSent);
        }, 2000); // Adjust polling interval as needed
    } catch (error) {
        console.error("Failed to process message:", error.response?.data || error.message);
        if (!responseSent.value) {
            responseSent.value = true;
            res.status(500).json({ error: "Failed to process message." });
        }
    }
});


// Start the server
const port = PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
