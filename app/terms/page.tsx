import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { COMPANY_NAME, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "利用規約",
  description: `${SITE_NAME}のAI社員SaaSサービスの利用規約。`,
};

export default function TermsPage() {
  return (
    <section className="py-24 pt-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-text-primary mb-4">利用規約</h1>
          <p className="text-sm text-text-secondary mb-12">最終更新日: 2026年4月17日</p>

          <div className="space-y-10 text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">第1条（適用）</h2>
              <p>
                本規約は、{COMPANY_NAME}（以下「当社」）が提供するAI社員SaaSサービス（以下「本サービス」）の
                利用に関する一切の関係に適用されます。お客様（以下「利用者」）は本サービスを利用することで、
                本規約に同意したものとみなされます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">第2条（契約の成立）</h2>
              <p>
                本サービスの利用契約は、利用者が当社所定の手続きに従って申込みを行い、
                当社がこれを承諾した時点で成立します。当社は、必要に応じて申込みを承諾しないことがあります。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">第3条（料金・支払い）</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>利用者は、選択したプランに応じた月額料金を支払うものとします。</li>
                <li>お試し採用プラン（2週間）は無料です。クレジットカードの登録は不要です。</li>
                <li>有料プランへの移行時は、毎月1日から末日までを1ヶ月とし、月末締め翌月末払いとします。</li>
                <li>中途解約の場合、当月末までの利用料金は日割り計算せず、満額お支払いいただきます。</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">第4条（禁止事項）</h2>
              <p>利用者は、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>他の利用者または第三者の権利を侵害する行為</li>
                <li>AIに対して違法・有害なコンテンツを生成させる行為</li>
                <li>リバースエンジニアリング、逆コンパイル、解析行為</li>
                <li>当社の承諾なく本サービスを再販売・再配布する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">第5条（サービスの停止・変更）</h2>
              <p>
                当社は、以下の場合にサービスを一時停止または変更することがあります。
                緊急時を除き事前に通知します。
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>システムのメンテナンス・アップデート時</li>
                <li>災害・障害等の不可抗力時</li>
                <li>外部API（Slack、Anthropic等）の障害・仕様変更時</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">第6条（AIの出力に関する注意）</h2>
              <p>
                本サービスはAIを用いて業務を補助するものであり、AIの出力内容の正確性・完全性を保証するものではありません。
                利用者は、重要な意思決定や法的判断等においては、必ず人間によるレビューを行うものとします。
                AIの出力に起因する損害について、当社は本規約第7条に定める範囲で責任を負います。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">第7条（免責・損害賠償）</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>当社は、本サービスの完全性・正確性・有用性を保証しません。</li>
                <li>
                  当社が利用者に対して負う損害賠償の総額は、
                  損害発生時から遡って過去6ヶ月間に利用者が当社に支払った料金の総額を上限とします。
                </li>
                <li>
                  ただし、当社の故意または重過失による場合はこの限りではありません。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">第8条（規約の変更）</h2>
              <p>
                当社は、必要に応じて本規約を変更することがあります。変更後の規約は、
                本サービス上に掲載した時点から効力を生じます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">第9条（準拠法・管轄裁判所）</h2>
              <p>
                本規約の準拠法は日本法とし、本サービスに関する紛争は東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-text-primary mb-4">お問い合わせ</h2>
              <p>
                {COMPANY_NAME}
                <br />
                メール：
                <a href="mailto:info@axe-ai.jp" className="text-accent hover:underline">
                  info@axe-ai.jp
                </a>
              </p>
            </section>
          </div>
        </div>
      </Container>
    </section>
  );
}
