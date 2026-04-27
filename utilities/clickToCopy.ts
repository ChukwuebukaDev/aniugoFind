import { toast } from "sonner";
const clipboardTexts = new Map<string, number>();
const TTL = 5000; // 5 seconds

export const clickToCopy = async (text: string) => {
  const now = Date.now();

  if (clipboardTexts.has(text)) {
    const lastTime = clipboardTexts.get(text)!;
    if (now - lastTime < TTL) {
      toast.error("Already copied recently!");
      return;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    clipboardTexts.set(text, now);
    toast.success("Copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy:", err);
    toast.error("Copy failed");
  }
};