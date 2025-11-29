"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcutOptions {
  /** Require meta key (Cmd on Mac, Ctrl on Windows) */
  meta?: boolean;
  /** Require shift key */
  shift?: boolean;
  /** Require alt key */
  alt?: boolean;
  /** Only trigger if target is not an input element */
  ignoreInputs?: boolean;
}

/**
 * Hook pour gérer les raccourcis clavier
 * @param key - Touche à écouter (ex: "k", "Escape")
 * @param callback - Fonction à appeler
 * @param options - Options de configuration
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: KeyboardShortcutOptions = {}
) {
  const {
    meta = false,
    shift = false,
    alt = false,
    ignoreInputs = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignorer si dans un input/textarea (sauf si ignoreInputs est false)
      if (ignoreInputs) {
        const target = event.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          // Exception pour Escape qui doit toujours fonctionner
          if (key !== "Escape") {
            return;
          }
        }
      }

      // Vérifier la touche
      if (event.key.toLowerCase() !== key.toLowerCase()) {
        return;
      }

      // Vérifier les modificateurs
      if (meta && !(event.metaKey || event.ctrlKey)) {
        return;
      }
      if (shift && !event.shiftKey) {
        return;
      }
      if (alt && !event.altKey) {
        return;
      }

      // Prévenir le comportement par défaut et appeler le callback
      event.preventDefault();
      callback();
    },
    [key, callback, meta, shift, alt, ignoreInputs]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Hook spécifique pour Cmd+K / Ctrl+K (ouvrir recherche)
 */
export function useCommandK(callback: () => void) {
  useKeyboardShortcut("k", callback, { meta: true });
}

/**
 * Hook spécifique pour Escape (fermer modale)
 */
export function useEscape(callback: () => void) {
  useKeyboardShortcut("Escape", callback, { ignoreInputs: false });
}
