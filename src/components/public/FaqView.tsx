import { HelpCircle } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Bu sistem ne yapar?",
    a: "CIS Benchmark ve NIST/ISO kaynaklarını RAG ile arar; işletim sistemi sıkılaştırma önerileri ve çalıştırılabilir hardening script'leri (bash/PowerShell/Ansible/REG/GPO) üretir.",
  },
  {
    q: "Hangi sistemleri destekler?",
    a: "Ubuntu 24.04 / 22.04 LTS, Windows 11 ve Windows Server 2025 hedefleri (toplam 800+ CIS kuralı).",
  },
  {
    q: "Üretilen script'ler güvenli mi?",
    a: "Üretim sırasında sözdizimi (bash -n) ve OutputValidator kontrolleri yapılır. Yine de production'a uygulamadan önce gözden geçirmeniz ve bir test/sandbox ortamında denemeniz önerilir.",
  },
  {
    q: "Cevaplar nereden geliyor?",
    a: "Her cevap CIS/NIST kaynaklarına dayanır; yanıtla birlikte kaynak referansları ve bir groundedness (kaynağa dayanma) güven skoru sunulur.",
  },
  {
    q: "Verilerim ne oluyor?",
    a: "Sohbet geçmişi yalnızca kendi hesabınıza özeldir (owner-scoped) ve 30 gün saklanır. Detaylar Gizlilik (KVKK) sayfasındadır.",
  },
  {
    q: "Maliyeti nedir?",
    a: "Ücretsiz-öncelikli LLM zinciri (Cerebras gpt-oss-120b) kullanılır; çalışma maliyeti pratikte ≈ $0'dır.",
  },
  {
    q: "API'yi kendi uygulamamda kullanabilir miyim?",
    a: "Evet. OpenAI-uyumlu bir /v1 ucu ve makine-makine (M2M) API-key desteği vardır. Erişim için İletişim sayfasından bize ulaşın.",
  },
  {
    q: "Hangi yapay zekâ modeli kullanılıyor?",
    a: "Birincil model Cerebras gpt-oss-120b; kesinti durumunda Gemini / SambaNova fallback zinciri devreye girer.",
  },
];

export function FaqView() {
  return (
    <PublicLayout
      eyebrow={<><HelpCircle size={13} aria-hidden="true" /> SSS</>}
      title="Sık sorulan sorular"
      intro="Sistemle ilgili en çok merak edilenler. Aradığınızı bulamazsanız İletişim sayfasından yazabilirsiniz."
    >
      <div className="flex flex-col gap-3">
        {FAQ.map((item) => (
          <details key={item.q} className="panel group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink">
              {item.q}
              <span className="font-mono text-accent transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </PublicLayout>
  );
}
