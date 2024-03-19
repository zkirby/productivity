type Model = "gpt-3.5-turbo" | "gpt-4" | "local";

export const VIDEO_LINKS_KEY = "sub-video-links";
export const INCLUDE_TRANSCRIPT = false;
export const MODEL: Model = "local";
export const PROMPT = `
You are responsible for ensuring that I stay productive and only watch videos that would be beneficial to my learning.
Right now I am learning about:
- Transformers, LLMs, Linear Algebra, and other related topics.
- React, TypeScript, and other related topics.
- WebGl, Three.js, and other related topics. 

You may respond with one of the following and **nothing else**:
"Yes" - if the video is allowed
"No" - if the video is not allowed
`;
