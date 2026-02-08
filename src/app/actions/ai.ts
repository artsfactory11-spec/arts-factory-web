"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

interface GenerateDescriptionParams {
    title: string;
    category: string;
    material: string;
    keywords?: string;
    imageBase64?: string; // Base64 encoded image string
}

export async function generateArtworkDescription({
    title,
    category,
    material,
    keywords = "",
    imageBase64
}: GenerateDescriptionParams) {
    if (!process.env.GEMINI_API_KEY) {
        return { success: false, error: "API Key가 설정되지 않았습니다." };
    }

    try {
        const parts: any[] = [];

        // 프롬프트 구성
        const textPrompt = `
당신은 예술을 통해 치유와 회복을 돕는 전문 아트 테라피스트이자 큐레이터입니다.
${imageBase64 ? "제공된 작품 이미지를 **직접 시각적으로 분석**하고, 아래 정보를 참고하여 설명글을 작성해 주세요." : "아래 작품 정보를 바탕으로 설명글을 작성해 주세요."}

[작품 정보]
- 제목: ${title}
- 카테고리: ${category}
- 재료/기법: ${material}
${keywords ? `- 키워드/특징: ${keywords}` : ""}

[요구사항]
- **한국어**로 작성할 것.
- **핵심 주제**: 작품이 가진 내면의 에너지를 **정신적, 육체적 회복(Recovery)의 관점**에서 해석하여 설명할 것.
- 작품의 시각적 요소(색감, 질감, 형태 등)가 관람자에게 어떤 안정감이나 활력을 주는지 구체적으로 묘사할 것.
- 문체는 정중하고 우아하며 따뜻한 위로를 건네는 듯한 어조 ("~합니다" 체).
- 길이는 3~5문장 내외로 작성할 것.
- **가독성을 위해 문단 사이에는 반드시 빈 줄(엔터 2번)을 넣어 명확히 구분할 것.**
- 오직 설명 내용만 출력할 것.
`;
        parts.push(textPrompt);

        // 이미지가 있으면 파트 추가
        if (imageBase64) {
            // "data:image/jpeg;base64,..." 형식이면 헤더 제거
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg", // 대략적으로 jpeg로 가정하거나, 클라이언트에서 받아서 처리 가능
                },
            });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        return { success: true, description: text.trim() };
    } catch (error: any) {
        console.error("Gemini Generation Error:", error);
        // 에러 메시지를 구체적으로 반환하여 디버깅 돕기
        const errorMessage = error.message || "설명 생성 중 알 수 없는 오류가 발생했습니다.";
        return { success: false, error: `Gemini API 오류: ${errorMessage}` };
    }
}
