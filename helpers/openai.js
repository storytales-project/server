const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const cloudinary = require("../config/cloudinary");
const axios = require("axios");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateStory(input) {
    const prompt = `can you create a ${input.mood} ${input.theme} themed bedtime fantasy story with a kid named ${input.character} as the main character, Create two paragraphs story in ${input.language} language and at the end of the story provide 3 options to continue the story, respond in an object format with the following format: {story: string of stories, chapter: string of chapter name that could fit the story, choices: array of string}`;
    const title = input.title;

    // 1. Generate Story
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-4-turbo",
    });

    const jsonResult = completion.choices[0].message.content;
    const parsed = JSON.parse(jsonResult);

    console.log(parsed);

    const story = parsed.story;

    // 2. Generate Audio

    const speechFile = path.resolve("./tempaudio.mp3");
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: story,
    });

    // 3. Save Audio

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    const audioUpload = await cloudinary.uploader.upload(speechFile, {
        resource_type: "video",
    });

    fs.unlinkSync(speechFile);

    const audioURL = audioUpload.url;


    // 4. Generate Image

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: title + "cute, 3D, colorful, disney style",
        n: 1,
        size: "1024x1024",
    });

    const imageUrl = response.data[0].url;

    const imageFile = path.resolve("./tempimage.png");
    const imageDownload = await axios({
        url: imageUrl,
        method: "GET",
        responseType: "stream",
    });

    const imageWriter = fs.createWriteStream(imageFile);
    imageDownload.data.pipe(imageWriter);

    await new Promise((resolve, reject) => {
        imageWriter.on("finish", resolve);
        imageWriter.on("error", reject);
    });

    // Upload the image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile, {
        resource_type: "image",
    });

    fs.unlinkSync(imageFile);

    const imageURL = imageUpload.url;

    return {
        story,
        chapter : parsed.chapter,
        choices : parsed.choices,
        audioURL,
        imageURL
    };
};

async function continueStory(pick, pages) {
    const currentStory = pages.reduce((accumulator, current) => {
        return accumulator + current.content + " ";
    }, "").trim();

    const currentPage = pages[pages.length - 1];

    const {choices} = currentPage;
    const stringified = JSON.stringify(choices);

    let prompt;

    if (pages.length < 2) {
        prompt = `Based on this story : ${currentStory}. there are multiple choices to continue the story : ${stringified}, please continue the story based on this pick : ${pick.choice}, Please give a response in these format {story : string of continued stories, chapter : string of chapter name that could fit the story, choices : array of string}`
    } else {
        prompt = `Based on this story : ${currentStory}. there are multiple choices to continue the story : ${stringified}, please end the story based on this pick : ${pick.choice}, Please give a response in these format {story : string of continued stories, chapter : string of chapter name that could fit the story, choices = []}`
    }

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-4-turbo",
    });

    const result = completion.choices[0].message.content;
    const parsed = JSON.parse(result);

    const story = parsed.story;

    console.log(story);

    const speechFile = path.resolve("./tempaudio.mp3");
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: story,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    const audioUpload = await cloudinary.uploader.upload(speechFile, {
        resource_type: "video",
    });

    fs.unlinkSync(speechFile);

    const audioURL = audioUpload.url;    

    return {
        chapter : parsed.chapter,
        content : parsed.story,
        audio : audioURL,
        choices : parsed.choices
    };
}

module.exports = { generateStory, continueStory };
