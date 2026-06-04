# Frontend — Proje Durumu (Tez Özeti, TR)

> Bitirme tezi için Türkçe özet. Operasyonel detay (kurulum, komut, Docker) kök
> [README.md](../README.md)'de; burada **mimari + ekranlar + backend entegrasyon + mevcut durum**.

## 1. Teknoloji
Vite + React 18 + TypeScript (strict) + Tailwind + react-router-dom + lucide-react. Test: Vitest.
Tip tanımları backend Pydantic şemalarından türetilmiştir (kontrat birebir).

## 2. Mimari (`src/`)
- **components/**: `chat`, `rules`, `dashboard`, `agent`, `artifacts`, `retrieval`, `auth`,
  `layout`, `welcome`, `ui` — ekran ve bileşen ailelerine ayrılmış.
- **context/**: `AuthContext.tsx` — oturum/JWT durumu uygulama genelinde.
- **hooks/**: `useChat.ts` (SSE streaming), `useChatHistory.ts` (geçmiş), `useRules.ts`,
  `useCategories.ts`, `useHealth.ts` — veri erişimi izole.
- **lib/**: `api.ts`/`http.ts` (API katmanı), `auth-token.ts` (JWT saklama/iliştirme),
  `permissions.ts` (RBAC görünürlüğü), `export.ts` (çıktı dışa aktarma), `format.ts`.

## 3. Ekranlar
1. **Asistan (Chat):** SSE ile token-token akan yanıt; Evidence paneli (rule ID / CIS section +
   benzerlik skoru); intent/safety/layer_path/model/gecikme/maliyet/doğrulama rozetleri;
   OS/rol/seviye/RAG/top-k ayarları; yıkıcı komut uyarısı.
2. **Kurallar (Rule Browser):** CIS kütüphanesinde filtre/arama/sayfalama; kural seçimi →
   çakışma + uygulama planı → Bash/PowerShell/Ansible/REG/GPO artifact üretip kopyalama/indirme.
3. **Pano (Dashboard):** `/health` + `/metrics` üzerinden gecikme (p50/p95/p99), istek/token, sağlayıcı dağılımı.

## 4. Backend entegrasyonu
Dev'de Vite proxy (`VITE_API_PROXY_TARGET`) `/api`, `/rag`, `/health`, `/metrics`'i backend'e yönlendirir.
Kullanılan endpoint'ler: `/chat`, `/chat/stream` (SSE), `/v1/chat/completions`, `/rag/search`,
`/health`, `/metrics` ve **auth**'lu uçlar.

## 5. Mevcut durum — auth + kullanıcı-bazlı geçmiş
- `AuthContext` + `auth-token.ts` ile **JWT oturum** zaten entegre; `permissions.ts` ile RBAC görünürlüğü.
- `useChatHistory.ts` mevcut → backend'in **kullanıcı-bazlı** geçmiş API'sine (`GET /chat/history`,
  JWT ile) bağlanır. Böylece geçmiş giriş yapan kullanıcıya **izole** çekilir; eski "herkes
  birbirinin geçmişini görüyor" sorunu için backend (owner-scoped SQLite) + bu hook birlikte çözümdür.
  *(Bkz. backend `docs/20_CHAT_HISTORY_VE_OTURUM.md`.)*

## 6. Kalite & dağıtım
`eslint` + `tsc --noEmit` temiz; `npm run build` üretim derlemesi (~69 kB gzip). Docker (dev: Vite+HMR,
prod: nginx). Aynı Docker/monitoring düzenine hizalı (deploy reposu).

## 7. Açık/gelecek
Responsive iyileştirme, dark mode, kullanıcı geri bildirim mekanizması (öneri formu 3.3 hedefleri).
