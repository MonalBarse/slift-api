// Using hono instead of express

// What this api is going to do is to filter the input and remove any words which are innapropriate
// Basically remove any profanity from the input
import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { Index } from "@upstash/vector";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

type Environment = {
  VECTOR_URL: string;
  VECTOR_TOKEN: string;
};

const app = new Hono();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 25, // The size of the chunk to split the input into
  separators: [" ", "\n", "\t"], // The characters to split the input on
  chunkOverlap: 12, // The number of characters to overlap between the chunks
});

app.use(cors()); // Similar to express middleware

const WHITELIST = ["fred", "shit", "smartass"]; // These are some safe words which for some reason are not considered profanity
app.post("/", async (c) => {
  if (c.req.header("Content-Type") !== "application/json") {
    c.json({ error: "Invalid Content-Type" }, { status: 406 });
  }

  try {
    const { VECTOR_URL, VECTOR_TOKEN } = env<Environment>(c);
    const index = new Index({
      url: VECTOR_URL,
      token: VECTOR_TOKEN,
      cache: false,
    });
    const body = await c.req.json();

    // ---------- Validate the input data ----------- //

    let { message } = body as { message: string };
    if (!message) {
      return c.json({ error: "Invalid data" }, { status: 400 });
    }
    if (message.length > 2000) {
      return c.json({ error: "Message too long (￣ヘ￣;)" }, { status: 413 });
    }
    //---------------------------------------------- //

    // ------------ Filter the message ------------- //
    message = message
      .split(/\s/)
      .filter((word) => !WHITELIST.includes(word.toLowerCase()))
      .join(" "); // What this does is to remove any word in the WHITELIST from the message and return the message
    //---------------------------------------------- //

    // ----Divide input into words or into chunk---- //
    const [wordBlobs, semanticBlobs] = await Promise.all([
      splitMessageIntoWords(message), // To scan the input on a word by word basis
      splitMessageIntoSemantics(message), // To scan the input on a semantic basis
    ]);

    // ---- and check for profanity in the input ---- //
    const flaggedWords = new Set<{ text: string; score: number }>(); // For storing the words which are flagged as profane

    const result = await Promise.all([
      // promise array element-1
      ...wordBlobs.map(async (word) => {
        const [vector] = await index.query({
          // The result of the query is stored in the vector variable which will be an array of the results
          topK: 1, // The number of results to return
          data: word, // The data to check profanity for
          includeMetadata: true, // Whether to include metadata in the result
        });
        if (vector && vector.score > 0.95) {
          flaggedWords.add({
            text: vector.metadata!.text as string,
            score: vector.score,
          });
        }
        return { score: 0 };
      }),
      // promise array element-2
      ...semanticBlobs.map(async (semantic) => {
        const [vector] = await index.query({
          topK: 1,
          data: semantic,
          includeMetadata: true,
        });
        if (vector && vector.score > 0.88) {
          flaggedWords.add({
            text: vector.metadata!.text as string,
            score: vector.score,
          });
        }
        return vector!;
      }),
    ]);
    //---------------------------------------------- //

    if (flaggedWords.size > 0) {
      //Sort
      const mostProfane = Array.from(flaggedWords).sort((a, b) =>
        b.score > a.score ? 1 : -1,
      )[0];
      return c.json({
        isProfane: true,
        score: mostProfane.score,
        flaggedFor: mostProfane.text,
      });
    } else {
      //
      const mostProfane = result.sort((a, b) =>
        b.score > a.score ? 1 : -1,
      )[0];
      return c.json({
        isProfane: false,
        score: mostProfane.score,
      }); // If the message is not flagged as profane
    }
  } catch (e) {}
});

function splitMessageIntoWords(message: string): string[] {
  return message.split(/\s/);
}

async function splitMessageIntoSemantics(message: string): Promise<string[]> {
  //checking if the message is single word if it is then return an empty array
  if (message.split(/\s/).length === 1) return [];
  // Since we are handling the single word case in the splitMessageIntoWords function
  // ---------------------------------------------------- //

  // The logic to split the message into semantics
  const documents = await splitter.createDocuments([message]);

  const blobs = documents.map((blob) => blob.pageContent);
  return blobs;
}

export default app;
