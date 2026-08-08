export const GUEST_MODE_EVENT = "guestModeChanged";

export function setGuestMode(value: boolean) {
  if (value) {
    localStorage.setItem("isGuestMode", "true");
  } else {
    localStorage.removeItem("isGuestMode");
  }
  window.dispatchEvent(new Event(GUEST_MODE_EVENT));
}

export function getGuestMode(): boolean {
  return localStorage.getItem("isGuestMode") === "true";
}
