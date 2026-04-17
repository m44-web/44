import { z } from "zod";

export const contactSchema = z.object({
  companyName: z.string().optional(),
  name: z.string().min(1, "お名前を入力してください"),
  phone: z.string().optional(),
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスを入力してください"),
  inquiryType: z.string().min(1, "お問い合わせ種別を選択してください"),
  message: z.string().min(1, "お問い合わせ内容を入力してください"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const inquiryTypes = [
  "AI社員のお試し採用について",
  "AI総務について",
  "AI営業アシスタントについて",
  "AI経理アシスタントについて",
  "AIカスタマーサポートについて",
  "料金について",
  "その他",
] as const;
