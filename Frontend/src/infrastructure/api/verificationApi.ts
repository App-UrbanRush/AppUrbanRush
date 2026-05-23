import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const verificationClient = axios.create({
  baseURL: API_URL,
});

export interface VerificationResult {
  verified: boolean;
  status: string;
  confidence: number;
  extractedData: any;
  mismatches: string[];
  message: string;
}

export const verifyDocumentApi = async (
  images: File[],
  formData: {
    cedula: string;
    firstName: string;
    firstLastName: string;
    expeditionDate: string;
    expeditionPlace: string;
  }
): Promise<VerificationResult> => {
  const data = new FormData();
  images.forEach((image) => {
    data.append("images", image);
  });
  data.append("cedula", formData.cedula);
  data.append("firstName", formData.firstName);
  data.append("firstLastName", formData.firstLastName);
  data.append("expeditionDate", formData.expeditionDate);
  data.append("expeditionPlace", formData.expeditionPlace);

  const response = await verificationClient.post("/verification/verify-document", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
