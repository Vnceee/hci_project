import { useEffect, useState, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

/**
 * Floating on-screen keyboard. Activates whenever a text input or textarea
 * receives focus, and disappears on blur. Tapping a key updates the focused
 * element's value via the React-friendly value setter so controlled inputs
 * stay in sync.
 *
 * Inputs can opt out by setting `data-no-osk="true"`.
 */
export default function OnScreenKeyboard() {
  const { theme } = useTheme();
  const [target, setTarget] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [shift, setShift] = useState(false);
  const kbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTextish = (el: EventTarget | null): el is HTMLInputElement | HTMLTextAreaElement => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.dataset.noOsk === "true") return false;
      if (el.tagName === "TEXTAREA") return true;
      if (el.tagName !== "INPUT") return false;
      const t = (el as HTMLInputElement).type;
      return t === "text" || t === "search" || t === "email" || t === "url" || t === "tel" || t === "" || !t;
    };

    const onFocus = (e: FocusEvent) => {
      if (isTextish(e.target)) setTarget(e.target);
    };
    const onFocusOut = (e: FocusEvent) => {
      // Ignore blurs caused by tapping a key on the keyboard itself.
      const next = e.relatedTarget as Node | null;
      if (next && kbRef.current?.contains(next)) return;
      // Defer so a click inside the keyboard can reclaim focus first.
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || !kbRef.current?.contains(active)) {
          if (active !== e.target) setTarget(null);
        }
      }, 60);
    };

    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  if (!target) return null;

  const setValue = (next: string) => {
    const proto = target instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    setter?.call(target, next);
    target.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const insertAtCaret = (chars: string) => {
    const el = target;
    const start = el.selectionStart ?? el.value.length;
    const end   = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + chars + el.value.slice(end);
    setValue(next);
    const caret = start + chars.length;
    requestAnimationFrame(() => {
      el.setSelectionRange?.(caret, caret);
    });
  };

  const backspace = () => {
    const el = target;
    const start = el.selectionStart ?? el.value.length;
    const end   = el.selectionEnd ?? el.value.length;
    if (start === 0 && end === 0) return;
    const cut = start === end ? start - 1 : start;
    const next = el.value.slice(0, cut) + el.value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      el.setSelectionRange?.(cut, cut);
    });
  };

  const rows = [
    ["1","2","3","4","5","6","7","8","9","0"],
    ["q","w","e","r","t","y","u","i","o","p"],
    ["a","s","d","f","g","h","j","k","l"],
    ["z","x","c","v","b","n","m"],
  ];

  // Prevent the buttons from stealing focus from the target input.
  const noFocusSteal = (e: React.MouseEvent | React.PointerEvent) => e.preventDefault();

  return (
    <div
      ref={kbRef}
      onMouseDown={noFocusSteal}
      onPointerDown={noFocusSteal}
      style={{
        position: "fixed",
        left: "50%", bottom: "20px",
        transform: "translateX(-50%)",
        background: theme.panelBg,
        border: `1px solid ${theme.border}`,
        borderRadius: "16px",
        padding: "12px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        display: "flex", flexDirection: "column", gap: "8px",
        zIndex: 9000,
        backdropFilter: "blur(12px)",
        maxWidth: "92vw",
        animation: "osk-rise 0.18s ease-out",
      }}
    >
      <style>{`
        @keyframes osk-rise { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>

      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
          {i === rows.length - 1 && <Key onClick={() => setShift(s => !s)} wide theme={theme} active={shift}>⇧</Key>}
          {row.map(k => {
            const label = shift && /[a-z]/.test(k) ? k.toUpperCase() : k;
            return (
              <Key key={k} onClick={() => { insertAtCaret(label); if (shift) setShift(false); }} theme={theme}>
                {label}
              </Key>
            );
          })}
          {i === rows.length - 1 && <Key onClick={backspace} wide theme={theme}>⌫</Key>}
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
        <Key onClick={() => insertAtCaret(",")} theme={theme}>,</Key>
        <Key onClick={() => insertAtCaret(" ")} theme={theme} style={{ width: "240px" }}>space</Key>
        <Key onClick={() => insertAtCaret(".")} theme={theme}>.</Key>
        <Key onClick={() => { target?.blur(); setTarget(null); }} theme={theme} wide>hide</Key>
      </div>
    </div>
  );
}

function Key({
  children, onClick, theme, wide, active, style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  theme: import("@/context/ThemeContext").Theme;
  wide?: boolean;
  active?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      tabIndex={-1}
      onClick={onClick}
      style={{
        minWidth: wide ? "48px" : "34px",
        height: "38px",
        padding: "0 10px",
        background: active ? theme.accent : theme.cardBg,
        color: active ? "#fff" : theme.text,
        border: `1px solid ${active ? theme.accent : theme.border}`,
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
