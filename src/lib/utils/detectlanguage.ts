import { franc } from "franc";

export const detectLanguage = (text: string) => {
  const languageCode = franc(text);
  return languageCode === "und" ? "en" : languageCode;
};