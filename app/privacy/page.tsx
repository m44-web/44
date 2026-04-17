import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { COMPANY_NAME, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: `${SITE_NAME}のプライバシーポリシー。お客様の個人情報・企業データの取り扱いについて。`,
};

export default function PrivacyPage() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            プライバシーポリシー
          </h1>
          <p className="text-sm text-text-secondary mb-12">最終更新日: 2026年4月17日</p>

          <div className="space-y-10 text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">1. はじめに</h2>
              <p>
                {COMPANY_NAME}（以下「当社」）は、当社が提供するAI社員SaaSサービス（以下「本サービス」）における
                お客様の個人情報および企業データの取扱いについて、以下のとおりプライバシーポリシーを定めます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">2. 取得する情報</h2>
              <p>当社は本サービスの提供にあたり、以下の情報を取得します。</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>お客様企業名、担当者氏名、メールアドレス、電話番号</li>
                <li>SlackワークスペースID、チャンネルID、ボットトークン</li>
                <li>お客様がアップロードする社内マニュアル、会議録音、業務データ</li>
                <li>AI社員とのやり取り履歴、処理結果</li>
                <li>サービス利用ログ、アクセスログ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">3. 利用目的</h2>
              <p>取得した情報は以下の目的でのみ利用します。</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>本サービスの提供・運営・改善</li>
                <li>お客様へのサポート提供</li>
                <li>料金の請求・決済</li>
                <li>重要なお知らせの送信</li>
                <li>利用規約違反の調査・対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                4. 第三者提供・AI学習への利用制限
              </h2>
              <p>
                当社は、お客様の業務データ・社内マニュアル・会議録音・やり取り履歴を、
                <strong className="text-accent">AIモデルの学習には一切利用しません</strong>
                。また、法令に基づく場合を除き、第三者に提供することはありません。
              </p>
              <p className="mt-3">
                本サービスで利用する外部AI API（Anthropic Claude、OpenAI Whisper 等）に対しても、
                それらのプロバイダー側で学習利用されない設定（Enterprise / Zero Data Retention 等）で接続します。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">5. データの保管と暗号化</h2>
              <p>
                お客様のデータは、暗号化されたクラウド環境（Supabase、Vercel）に保管されます。
                お客様企業ごとに論理的に環境を分離し、他社データと混在しないように管理します。
                転送時はTLS 1.3以上、保存時はAES-256で暗号化します。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">6. 保有期間</h2>
              <p>
                お客様のデータは、サービス利用期間中および解約後30日間まで保管します。
                解約後30日を経過したデータは、バックアップを含めて復元不能な形で削除します。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">7. お客様の権利</h2>
              <p>
                お客様は、当社が保有するご自身・ご自社の情報について、開示・訂正・削除・利用停止を
                請求することができます。請求は以下のメールアドレス宛にご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">8. お問い合わせ窓口</h2>
              <p>
                {COMPANY_NAME}
                <br />
                個人情報保護責任者：心（AI CEO）
                <br />
                メール：
                <a href="mailto:privacy@axe-ai.jp" className="text-accent hover:underline">
                  privacy@axe-ai.jp
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">9. 改定</h2>
              <p>
                本ポリシーは、法令の変更やサービス内容の変更に応じて適宜改定する場合があります。
                重要な変更がある場合は、本サービス上で事前にお知らせします。
              </p>
            </section>
          </div>
        </div>
      </Container>
    </section>
  );
}
