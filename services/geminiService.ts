import { GoogleGenAI, Type } from "@google/genai";
import type { Language, ConvertedFile } from '../types';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    files: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          path: {
            type: Type.STRING,
            description: "The new path of the converted file, e.g., 'src/main.rs'",
          },
          content: {
            type: Type.STRING,
            description: "The full content of the converted file",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  required: ["files"],
};


const formatFileContent = async (files: File[]): Promise<string> => {
  const fileContents = await Promise.all(
    files.map(file => 
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const path = file.webkitRelativePath || file.name;
          resolve(`--- START FILE: ${path} ---\n${text}\n--- END FILE: ${path} ---`);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      })
    )
  );
  return fileContents.join('\n\n');
};

const generatePrompt = (sourceLanguage: Language, targetLanguage: Language, formattedFileContent: string): string => `
You are an expert polyglot programmer specializing in large-scale codebase migrations. Your task is to convert an entire project from ${sourceLanguage.name} to idiomatic ${targetLanguage.name}.

You must adhere to the following principles STRICTLY:
1.  **Full Project Context**: Analyze all provided files together to understand cross-file dependencies, modules, and the overall architecture before converting. Do not convert files in isolation.
2.  **Architecture Preservation**: The output directory structure and file naming conventions must mirror the input, only changing file extensions where appropriate (e.g., .py to .rs). For single file uploads without a directory structure, create a logical structure if necessary.
3.  **Functionality Equivalence**: The business logic and functionality of the original code must be preserved.
4.  **Idiomatic Conversion**: Use standard libraries, conventions, and best practices for ${targetLanguage.name}. For example, if converting from Python, use Rust's Result/Option types for error handling instead of exceptions.
5.  **Naming and Semantics**: Retain all original variable names, function names, class names, and module names unless a direct equivalent is impossible or unidiomatic.
6.  **Comments and Docs**: Preserve all inline comments, docstrings, and other documentation from the original source code in the converted files.

**INPUT PROJECT STRUCTURE AND FILES:**

${formattedFileContent}

**CONVERSION TASK:**
Convert the entire ${sourceLanguage.name} project above into a complete, functional ${targetLanguage.name} project.

**OUTPUT FORMAT:**
You MUST return a single, valid JSON object. Do not include any text or markdown before or after the JSON object. The JSON object must conform to this exact schema:
{
  "files": [
    {
      "path": "string (the new path of the converted file, e.g., 'src/main.rs')",
      "content": "string (the full content of the converted file)"
    }
  ]
}
`;

export const convertCodebase = async (
  files: File[],
  sourceLanguage: Language,
  targetLanguage: Language
): Promise<ConvertedFile[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please ensure the API_KEY environment variable is set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const formattedFileContent = await formatFileContent(files);
  const prompt = generatePrompt(sourceLanguage, targetLanguage, formattedFileContent);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.1,
    }
  });

  const jsonString = response.text.trim();
  const result = JSON.parse(jsonString);
  return result.files;
};