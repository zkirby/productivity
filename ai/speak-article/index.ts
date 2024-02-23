import fs from "fs";
import path from "path";
import OpenAI from "openai";

import axios from "axios";
import cheerio from "cheerio";

async function extractTextFromHTML(url: string) {
  try {
    // Fetch the HTML content from the URL
    const response = await axios.get(url);

    // Load HTML content into Cheerio
    const $ = cheerio.load(response.data);

    // Extract text from the HTML
    const text = $("body").text();

    // Remove extra whitespaces and newlines
    const cleanedText = text.replace(/\s+/g, " ");

    return cleanedText;
  } catch (error) {
    console.error("Failed to fetch the webpage", error);
    return null;
  }
}

const openai = new OpenAI({
  apiKey: "", // key here
});

const speechFile = path.resolve("./speech.mp3");

async function main() {
  const text = await extractTextFromHTML(
    "https://learnwebgl.brown37.net/rendering/shader_primer.html"
  );

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a world class educator." },
      {
        role: "user",
        content: `
      The following text is an educational module from a website. Please remove any text that is not part of the module such as
      html tags, css, javascript, and any other text that is not part of the module.

      Also, pretend to be a professor reading the text to me. Read the text verbatim and then explain or elaborate any parts of the text that might be particularly confusing.

      TEXT
      ${text}
`,
      },
    ],
    model: "gpt-4-turbo-preview",
  });

  console.log(completion.choices[0].message.content);

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: completion.choices[0].message.content?.slice(0, 4000) as string,
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
}
main();
