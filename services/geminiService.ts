
import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult } from "../types";

// Mock mode - bypasses API calls for testing
const USE_MOCK_API = true;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const verifyDocument = async (
  imageBuffer: string,
  documentType: 'AADHAR' | 'VOTER_ID'
): Promise<VerificationResult> => {
  // Mock implementation for testing without API
  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    if (documentType === 'AADHAR') {
      return {
        success: true,
        message: "Aadhar verified successfully",
        extractedData: {
          id: "XXXX-XXXX-1234",
          name: "John Doe",
          location: "Karnataka - Hassan Holenarasipura"
        }
      };
    } else {
      return {
        success: true,
        message: "Voter ID verified successfully",
        extractedData: {
          id: "ABC1234567",
          name: "John Doe",
          location: "Karnataka - Hassan Holenarasipura",
          hasPhoto: true
        }
      };
    }
  }

  try {
    const prompt = documentType === 'AADHAR'
      ? "ACT AS A BORDER SECURITY AGENT. This is an Aadhar card. It is the PRIMARY JURISDICTIONAL DOCUMENT. 1. Extract the State and City/District from the address field. 2. Extract the Full Name and last 4 digits. 3. Verify it is not a screen capture. Aadhar MUST be used to decide the voting location. Return JSON."
      : "ACT AS A BIOMETRIC ANALYST. This is a Voter ID card. 1. Extract the EPIC number. 2. IMPORTANT: Verify if there is a clear portrait image of a person on the card. 3. Extract the person's name. 4. Check for holographic tamper-evident features. This document is used to verify the voter's identity through their photo. Return JSON.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          parts: [
            { inlineData: { data: imageBuffer.split(',')[1], mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN },
            message: { type: Type.STRING },
            extractedId: { type: Type.STRING },
            extractedName: { type: Type.STRING },
            extractedLocation: { type: Type.STRING, description: 'Jurisdiction found on document' },
            hasClearPhoto: { type: Type.BOOLEAN, description: 'True if a face photo is detected on the ID card' },
            forgeryRisk: { type: Type.NUMBER, description: '0 to 1 scale' }
          },
          required: ['success', 'message']
        }
      }
    });

    const result = JSON.parse(response.text);
    if (result.forgeryRisk > 0.4) {
      return { success: false, message: "Security Alert: Decentralized nodes flagged this document as high-risk for forgery." };
    }

    if (documentType === 'VOTER_ID' && result.success && !result.hasClearPhoto) {
      return { success: false, message: "Identification Error: The portrait photo on the Voter ID is missing or unclear. Capture again." };
    }

    return {
      success: result.success,
      message: result.message,
      extractedData: {
        id: result.extractedId,
        name: result.extractedName,
        location: result.extractedLocation,
        hasPhoto: result.hasClearPhoto
      }
    };
  } catch (error) {
    return { success: false, message: "Neural verification timed out. Please ensure the card is in focus and well-lit." };
  }
};

export const verifyFace = async (imageBuffer: string): Promise<VerificationResult> => {
  // Mock implementation for testing without API
  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return {
      success: true,
      message: "Face verification successful",
      duressDetected: false,
      matchingConfidence: 0.95
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          parts: [
            { inlineData: { data: imageBuffer.split(',')[1], mimeType: 'image/jpeg' } },
            { text: "CROSS-REFERENCE BIOMETRICS: Compare this live face with the earlier captured Voter ID portrait data. 1. Is it the same person? 2. Is there LIVENESS (not a photo of a photo)? 3. Is the user under pressure or duress? Return JSON." }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN },
            message: { type: Type.STRING },
            duressDetected: { type: Type.BOOLEAN },
            matchingConfidence: { type: Type.NUMBER, description: 'Biometric match confidence' }
          },
          required: ['success', 'message', 'duressDetected']
        }
      }
    });

    const result = JSON.parse(response.text);
    if (result.duressDetected) {
      return { success: false, message: "Safety Alert: Facial analysis suggests possible duress. Voting session suspended for protection." };
    }
    if (result.matchingConfidence < 0.7) {
      return { success: false, message: "Biometric Mismatch: The live face does not match the image on the Voter ID." };
    }
    return result;
  } catch (error) {
    return { success: false, message: "Face recognition node error. Retrying biometric scan..." };
  }
};
