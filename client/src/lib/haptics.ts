export function vibrate(pattern: number | number[]) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch {
            // Vibration not supported or blocked — silently skip
        }
    }
}