export const HOME_HREF = '/(tabs)/index' as const;

export interface BackRouter<Href> {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: Href) => void;
}

export function goBackOrHome<Href>(router: BackRouter<Href>, fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
