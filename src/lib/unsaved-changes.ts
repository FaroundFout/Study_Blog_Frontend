export const UNSAVED_CHANGES_EVENT = "study-garden:confirm-unsaved-changes";
export const UNSAVED_CHANGES_MESSAGE = "还有未保存的修改，离开后将丢失这些内容。确定离开吗？";

/** Call before non-link departures such as signing out, before clearing any state. */
export function confirmUnsavedChanges() {
  return window.dispatchEvent(new Event(UNSAVED_CHANGES_EVENT, { cancelable: true }));
}

interface NavigationDeparture extends Event {
  navigationType: string;
  hashChange: boolean;
  destination: { sameDocument: boolean };
}

/** No history sentinels or Next router internals: existing back/forward entries stay intact. */
export function installUnsavedChangesGuard(isDirty: () => boolean) {
  let approvedUnloadUntil = 0;
  const confirm = () => !isDirty() || window.confirm(UNSAVED_CHANGES_MESSAGE);
  const beforeUnload = (event: BeforeUnloadEvent) => {
    if (!isDirty() || Date.now() < approvedUnloadUntil) return;
    event.preventDefault();
    event.returnValue = "";
  };
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
    const target = new URL(anchor.href, window.location.href);
    const current = new URL(window.location.href);
    // Cross-document/external departures use the browser's native beforeunload dialog.
    if (target.origin !== current.origin || !["http:", "https:"].includes(target.protocol)) return;
    if (target.pathname === current.pathname && target.search === current.search) return;
    if (!confirm()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    } else if (isDirty()) {
      // Avoid a duplicate native prompt for ordinary same-origin anchors.
      approvedUnloadUntil = Date.now() + 1000;
    }
  };
  const onDeparture = (event: Event) => {
    if (!event.defaultPrevented && !confirm()) event.preventDefault();
  };
  const onNavigate = (event: Event) => {
    const navigationEvent = event as NavigationDeparture;
    // Only handle cancelable same-document history traversals. Next handles push/replace.
    if (navigationEvent.navigationType !== "traverse" || !navigationEvent.destination.sameDocument ||
      navigationEvent.hashChange || !event.cancelable || event.defaultPrevented) return;
    if (!confirm()) event.preventDefault();
  };
  const navigation = (window as Window & { navigation?: EventTarget }).navigation;
  window.addEventListener("beforeunload", beforeUnload);
  document.addEventListener("click", onClick, { capture: true });
  window.addEventListener(UNSAVED_CHANGES_EVENT, onDeparture);
  navigation?.addEventListener("navigate", onNavigate);
  return () => {
    window.removeEventListener("beforeunload", beforeUnload);
    document.removeEventListener("click", onClick, { capture: true });
    window.removeEventListener(UNSAVED_CHANGES_EVENT, onDeparture);
    navigation?.removeEventListener("navigate", onNavigate);
  };
}
