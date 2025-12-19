
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";
import { Language } from "../i18n";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeMineruOutput(markdown: string, imageNames: string[], lang: Language = 'zh'): Promise<AnalysisResult> {
    const languageName = lang === 'zh' ? '简体中文 (Simplified Chinese)' : 'English';
    
    const systemInstruction = `你是一位世界级的 UI/UX 设计师和科研内容分析专家。
你的任务是将 MinerU 解析出的论文 Markdown 内容转化为一个高度美观、具有 Linear App 风格的可视化网页布局。
要求：
1. 提取论文的核心贡献、关键实验数据、技术架构和结论。
2. 识别论文中提到的重要图表说明，并从提供的图片文件名列表中选择最匹配的文件名填入 'imageUrl'。
3. 所有生成的文本内容（标题、摘要、列表、图表标签）必须使用 ${languageName}。
4. 结构要清晰，利用 stats 展现数据，利用 chart 展现趋势，利用 gallery 展现原图。
5. 设计风格：简约、现代、高对比度、呼吸感强。`;

    const prompt = `
      以下是论文内容 (Markdown):
      ${markdown.substring(0, 18000)}

      可用的原始图片文件名列表: [${imageNames.join(', ')}]
      
      请生成符合 AnalysisResult 接口的 JSON。
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: this.getSchema(),
      }
    });

    return JSON.parse(response.text || '{}');
  }

  async analyzeContent(content: string, contentType: string, lang: Language = 'zh'): Promise<AnalysisResult> {
    const languageName = lang === 'zh' ? '简体中文' : 'English';
    const response = await this.ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `分析以下${contentType}内容并返回可视化布局 JSON。请使用 ${languageName} 生成内容: ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: this.getSchema(),
      }
    });
    return JSON.parse(response.text || '{}');
  }

  private getSchema() {
    return {
      type: Type.OBJECT,
      required: ["title", "subtitle", "summary", "sections"],
      properties: {
        title: { type: Type.STRING, description: "网页大标题" },
        subtitle: { type: Type.STRING, description: "副标题" },
        summary: { type: Type.STRING, description: "核心摘要（100字左右）" },
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "type", "title"],
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["text", "stats", "chart", "list", "gallery"] },
              title: { type: Type.STRING },
              content: { type: Type.STRING, description: "针对 text 类型" },
              stats: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING }
                  }
                }
              },
              chartType: { type: Type.STRING, enum: ["bar", "line", "pie"] },
              chartData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER }
                  }
                }
              },
              listItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              galleryItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    imageUrl: { type: Type.STRING, description: "必须使用提供的图片文件名" }
                  }
                }
              }
            }
          }
        }
      }
    };
  }
}
