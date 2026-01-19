import arcjet, {shield, detectBot, slidingWindow} from "@arcjet/node";


const isTest = process.env.NODE_ENV === "test";
const arcjetKey = process.env.ARCJET_KEY ?? (isTest ? "test" : undefined);
if (!arcjetKey) {
      throw new Error("ARCJET_KEY is not set in .env file");
    }

const aj = arcjet({
    // Get your site key from https://app.arcjet.com and set it as an environment
    // variable rather than hard coding.
    key: arcjetKey,
    rules: [
        // Shield protects your app from common attacks e.g. SQL injection
        shield({ mode: "LIVE" }),
        // Create a bot detection rule
        detectBot({
            mode: "LIVE",
            allow: [
                "CATEGORY:SEARCH_ENGINE",
                "CATEGORY:PREVIEW"
            ],
        }),
        slidingWindow({
            mode: 'LIVE',
            interval: '2s',
            max: 5
        })

    ],
});

export default aj;