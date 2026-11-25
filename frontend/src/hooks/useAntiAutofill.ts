import { useState, useMemo, type CSSProperties } from 'react';

/**
 * Prevents browsers from auto-filling stale saved credentials into public auth forms
 * on initial load, locking each field independently until user interaction.
 */
export function useAntiAutofill() {
  const [unlockedMap, setUnlockedMap] = useState<Record<string, boolean>>({});

  const supportsTextSecurity = useMemo(
    () =>
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('-webkit-text-security', 'disc'),
    []
  );

  const unlockField = (fieldKey = 'default') => {
    setUnlockedMap((prev) => (prev[fieldKey] ? prev : { ...prev, [fieldKey]: true }));
  };

  const isFieldUnlocked = (fieldKey = 'default'): boolean => Boolean(unlockedMap[fieldKey]);

  // Backwards-compatible aggregate helper when a caller passes no key
  const fieldsUnlocked = isFieldUnlocked('default');
  const unlockFields = () => unlockField('default');

  const maskedInputType = (revealed: boolean, fieldKey = 'default'): 'text' | 'password' =>
    revealed || !isFieldUnlocked(fieldKey) || supportsTextSecurity ? 'text' : 'password';

  const maskedInputStyle = (revealed: boolean, fieldKey = 'default'): CSSProperties | undefined =>
    supportsTextSecurity && isFieldUnlocked(fieldKey)
      ? ({ WebkitTextSecurity: revealed ? 'none' : 'disc' } as CSSProperties)
      : undefined;

  return {
    fieldsUnlocked,
    unlockFields,
    isFieldUnlocked,
    unlockField,
    maskedInputType,
    maskedInputStyle,
  };
}
