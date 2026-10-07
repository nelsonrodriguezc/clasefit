import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

/**
 * Reloads a screen every time its tab gains focus, so each tab reflects changes made in the other.
 * `onBlur` runs when the tab loses focus (e.g. to clear messages that could become outdated).
 */
export function useRefreshOnFocus(refresh: () => Promise<void>, onBlur?: () => void): void {
  useFocusEffect(
    useCallback(() => {
      void refresh();
      return onBlur;
    }, [refresh, onBlur]),
  );
}
