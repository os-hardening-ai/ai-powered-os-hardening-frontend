import "@testing-library/jest-dom/vitest";

// jsdom Element.scrollTo'yu uygulamaz; ChatView mount'ta çağırır → no-op stub.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
