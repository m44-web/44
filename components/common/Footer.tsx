import Link from "next/link";
import { navLinks } from "@/lib/data/navigation";
import {
  SITE_NAME,
  COMPANY_NAME,
  COMPANY_ADDRESS,
} from "@/lib/constants";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="bg-sub-bg border-t border-border">
      <Container className="py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="text-xl font-bold tracking-wider">
              <span className="text-accent">AXE</span>
            </Link>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              AIを、雇おう。
              <br />
              AI社員があなたの会社の
              <br />
              新しい仲間になります。
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-text-primary mb-4">ページ</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-text-primary mb-4">運営会社</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>{COMPANY_NAME}</li>
              <li>{COMPANY_ADDRESS}</li>
              <li>
                <a
                  href="mailto:info@axe-ai.jp"
                  className="hover:text-accent transition-colors"
                >
                  info@axe-ai.jp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} {SITE_NAME} / {COMPANY_NAME}. All
          rights reserved.
        </div>
      </Container>
    </footer>
  );
}
