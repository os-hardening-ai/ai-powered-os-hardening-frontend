# OS Hardening Console — Frontend

**AI destekli işletim sistemi sıkılaştırma platformunun React + TypeScript arayüzü.**

Bilgisayar Mühendisliği Bitirme Projesi · _Sıkılaştırma ve Zero-Trust Alanında RAG Sistemi_

Bu repo, FastAPI tabanlı **AI-Powered OS Hardening API**'sinin (RAG + Rule Engine + Artifact Generator)
web istemcisidir. Üç ana iş akışı sunar:

1. **Asistan (Chat)** — CIS Benchmark kaynaklarına dayandırılmış (grounded) güvenlik danışmanlığı; her yanıtın
   altında kullanılan kaynaklar (rule ID / section) **Evidence** olarak gösterilir.
2. **Kurallar** — CIS kural kütüphanesini filtrele/ara, kural seç, çakışma planı çıkar ve **hardening script**
   (Bash / PowerShell / Ansible / REG / GPO) üret + indir.
3. **Pano** — Backend sağlık durumu ve performans metrikleri (gecikme, istek, token, sağlayıcı dağılımı).

---

## Teknoloji

| Katman      | Seçim                                            |
| ----------- | ------------------------------------------------ |
| Build       | Vite 5                                           |
| Framework   | React 18 + TypeScript (strict)                   |
| Yönlendirme | React Router 6                                   |
| Stil        | Tailwind CSS 3 (CSS değişkeni tabanlı tasarım)   |
| İkonlar     | lucide-react                                     |
| Streaming   | `fetch` + manuel SSE parser (POST stream desteği) |

Harici state/HTTP kütüphanesi yok — API katmanı tek bir tipli `fetch` sarmalayıcısı üzerine kuruludur.

---

## Hızlı Başlangıç

```bash
# 1. Bağımlılıklar
npm install

# 2. Ortam değişkeni (opsiyonel — dev'de proxy varsayılan)
cp .env.example .env

# 3. Backend'i ayağa kaldır (ayrı repoda, varsayılan: http://localhost:8000)
#    Bu repo VITE_API_PROXY_TARGET üzerinden /api, /rag, /health, /metrics isteklerini proxy'ler.

# 4. Geliştirme sunucusu  →  http://localhost:5173
npm run dev
```

### Komutlar

| Komut               | Açıklama                          |
| ------------------- | --------------------------------- |
| `npm run dev`       | Vite dev sunucusu (HMR + proxy)   |
| `npm run build`     | `tsc -b` + production build        |
| `npm run preview`   | Build çıktısını önizle            |
| `npm run typecheck` | Sadece tip kontrolü               |
| `npm run lint`      | ESLint                            |

---

## Backend Bağlantısı

Geliştirmede CORS yaşamamak için Vite dev sunucusu istekleri backend'e **proxy**'ler
(`vite.config.ts`). Üretimde ise `.env` içindeki `VITE_API_BASE_URL` değerini deploy edilen
API origin'ine ayarlayın:

```env
VITE_API_BASE_URL=https://api.ornek.com
```

### Kullanılan endpoint'ler

| Endpoint                     | Nerede                          |
| ---------------------------- | ------------------------------- |
| `POST /api/chat`             | Asistan (standart yanıt)        |
| `POST /api/chat/stream`      | Asistan (SSE token streaming)   |
| `GET  /api/rules`            | Kural kütüphanesi (filtre+sayfa) |
| `POST /api/rules/plan`       | Çalıştırma planı + çakışmalar   |
| `POST /api/artifacts/generate` | Script üretimi               |
| `GET  /health`               | Üst bardaki sağlık göstergesi   |
| `GET  /metrics`              | Pano metrikleri                 |

Tüm istek/yanıt tipleri `src/types/api.ts` içinde, backend Pydantic şemalarıyla birebir tanımlıdır.

---

## Proje Yapısı

```
src/
├── main.tsx, App.tsx            # giriş + yönlendirme
├── config.ts                    # API base URL, OS/rol/format seçenekleri
├── index.css                    # tasarım token'ları (SOC konsol teması)
├── types/api.ts                 # backend ile birebir tip sözleşmesi
├── lib/
│   ├── http.ts                  # fetch sarmalayıcı + tipli hata normalizasyonu
│   ├── api.ts                   # tüm endpoint çağrıları + SSE stream parser
│   └── format.ts                # biçimlendirme + tehlikeli komut sezgisi
├── hooks/
│   ├── useChat.ts               # sohbet durumu, streaming, oturum geçmişi
│   ├── useRules.ts              # kural çekme, filtre, sayfalama
│   └── useHealth.ts             # /health yoklama
└── components/
    ├── layout/AppShell.tsx      # sidebar + üst bar
    ├── chat/                    # ChatView, MessageBubble, MessageContent,
    │                            #   EvidencePanel, ContextControls, Composer
    ├── rules/                   # RulesView, RuleRow, RuleFilters
    ├── artifacts/ArtifactBuilder.tsx
    ├── dashboard/DashboardView.tsx
    └── ui/ui.tsx                # Badge, Card, Select, Toggle, Spinner...
```

---

## Güvenlik & Grounding Notları

Proje gereksinimleri doğrultusunda arayüz şunları uygular:

- **Grounded yanıtlar** — asistan yanıtının altında kullanılan CIS kaynakları (rule ID / section + benzerlik
  skoru) **Evidence** bloğunda listelenir; kaynak metni açılır.
- **Tehlikeli komut uyarısı** — hem sohbet kod bloklarında hem üretilen script'lerde geri dönüşü olmayan
  komutlar (örn. `rm -rf`, `dd if=`, `mkfs`, fork-bomb) tespit edilip kullanıcı uyarılır.
- **Şeffaf pipeline** — her yanıtta intent, güvenlik kategorisi, katman yolu (`1->2->3B->4`), model, gecikme,
  maliyet ve (varsa) claim doğrulama güven skoru rozet olarak gösterilir.

> Üretilen script'ler doğrudan CIS YAML kural veritabanından türetilir. Çalıştırmadan önce izole bir ortamda
> test edilmesi ve sistem yedeği alınması önerilir.

---

## Lisans

MIT — eğitim/bitirme projesi kapsamında.
