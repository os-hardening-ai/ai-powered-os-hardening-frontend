import { FileText, ShieldCheck } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";

type Section = { h: string; p: string };

const PRIVACY: Section[] = [
  { h: "Toplanan veriler", p: "Hesap bilgileri (kullanıcı adı, e-posta, parola — bcrypt ile hash'li), iletişim formu (ad, e-posta, mesaj) ve sohbet geçmişiniz (yalnız kendi hesabınıza özeldir)." },
  { h: "İşleme amacı", p: "Hizmetin sunulması, geri bildirimlerin değerlendirilmesi, güvenlik ve denetim (audit log)." },
  { h: "Saklama süresi", p: "Sohbet geçmişi 30 gün sonra silinir. İletişim mesajları ekip e-postasına iletilir." },
  { h: "Güvenlik", p: "Parolalar bcrypt ile hash'lenir, trafik TLS ile şifrelenir, erişim rol-bazlıdır (RBAC) ve hız sınırı uygulanır." },
  { h: "Haklarınız (KVKK m.11)", p: "Kişisel verilerinize erişme, düzeltme, silme ve işlemeye itiraz haklarına sahipsiniz. Talepleriniz için: hardeningai@gmail.com." },
  { h: "Akademik proje notu", p: "Bu sistem bir üniversite bitirme projesidir; ticari bir hizmet değildir." },
];

const TERMS: Section[] = [
  { h: "Hizmetin niteliği", p: "Akademik bir bitirme projesidir ve 'olduğu gibi' (as-is) sunulur; kesintisizlik veya hatasızlık garantisi verilmez." },
  { h: "Üretilen içerik", p: "Üretilen sıkılaştırma önerileri ve script'ler birer öneridir. Production sistemlere uygulamadan önce gözden geçirilmeli ve test/sandbox ortamında denenmelidir." },
  { h: "Sorumlu kullanım", p: "Sistem yalnız yetkili olduğunuz sistemlerin güvenliğini artırmak için kullanılmalıdır; kötüye kullanım yasaktır." },
  { h: "Sorumluluk reddi", p: "Üretilen içeriğin uygulanmasından doğan sonuçlardan kullanıcı sorumludur." },
  { h: "Değişiklikler", p: "Hizmet ve bu şartlar önceden bildirilmeksizin güncellenebilir." },
];

export function LegalView({ kind }: { kind: "privacy" | "terms" }) {
  const isPrivacy = kind === "privacy";
  const data = isPrivacy ? PRIVACY : TERMS;
  return (
    <PublicLayout
      eyebrow={
        isPrivacy ? (
          <><ShieldCheck size={13} aria-hidden="true" /> Gizlilik / KVKK</>
        ) : (
          <><FileText size={13} aria-hidden="true" /> Kullanım Şartları</>
        )
      }
      title={isPrivacy ? "Gizlilik Politikası (KVKK)" : "Kullanım Şartları"}
      intro={
        isPrivacy
          ? "Kişisel verilerinizin nasıl işlendiğini ve haklarınızı açıklar."
          : "Sistemi kullanırken geçerli olan koşullar."
      }
    >
      <div className="flex flex-col gap-4">
        {data.map((s) => (
          <section key={s.h} className="panel p-4">
            <h2 className="mb-1 text-sm font-semibold text-ink">{s.h}</h2>
            <p className="text-[13px] leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </div>
      <p className="mt-6 font-mono text-[11px] text-faint">
        Son güncelleme: 2026-06 · İletişim: hardeningai@gmail.com
      </p>
    </PublicLayout>
  );
}
