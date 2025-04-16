require("dotenv").config();
const OpenAI = require("openai");
const { OPENAI_API_KEY, ASSISTANT_ID } = process.env;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

(async () => {
    try {
        // Step 1: Create a new thread
        console.log("Creating a new thread...");
        const thread = await openai.beta.threads.create();
        const threadId = thread.id;
        console.log("Thread created:", threadId);

        // Step 2: Add a message to the thread
        const userMessage = "Convert 'Bench Press, 3 sets of 10 reps at 100 lbs' into JSON.";
        console.log("Adding message to thread:", threadId);
        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: userMessage,
        });
        console.log("Message added successfully.");

        // Step 3: Run the assistant
        console.log("Running assistant for thread:", threadId);
        const runResponse = await openai.beta.threads.runs.create(threadId, {
            assistant_id: ASSISTANT_ID,
        });
        const runId = runResponse.id;
        console.log("Run started:", runId);

        // Step 4: Poll for completion
        const maxPolls = 10; // Maximum number of polling attempts
        let polls = 0;
        let runStatus = "queued";

        while (polls < maxPolls && (runStatus === "queued" || runStatus === "in_progress")) {
            console.log("Checking run status...");
            const runCheck = await openai.beta.threads.runs.retrieve(threadId, runId);
            runStatus = runCheck.status;
            console.log("Current run status:", runStatus);

            if (runStatus === "completed") {
                console.log("Run completed. Retrieving messages...");
                const messagesList = await openai.beta.threads.messages.list(threadId);
                const messages = messagesList.body.data.map((message) => message.content);
                console.log("Assistant response:", messages);
                break;
            } else if (runStatus === "failed") {
                console.error("Run failed. Additional details:", runCheck);
                throw new Error("Run failed.");
            } else {
                polls++;
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before polling again
            }
        }

        if (polls >= maxPolls) {
            console.warn("Run did not complete within the maximum polling attempts.");
        }
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
})();
