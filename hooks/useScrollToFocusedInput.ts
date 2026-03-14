import { useCallback, useRef } from 'react';
import { ScrollView } from 'react-native';

const DONE_BAR_HEIGHT = 44;
const HEADER_HEIGHT = 88;
const SCROLL_DELAY_MS = 300;
const EXTRA_PADDING_ABOVE_INPUT = 24;

/**
 * Use with a ScrollView to scroll the focused input into view above the keyboard + Done bar.
 * - registerField(index): use on direct children of scroll content; spread on wrapper View, pass onFocus to TextInput.
 * - setLayoutY(indices, y): for fields inside a row, call from the row's onLayout so both get the row's Y.
 */
export function useScrollToFocusedInput(keyboardHeight: number = 0) {
  const scrollRef = useRef<ScrollView>(null);
  const fieldYRef = useRef<Record<number, number>>({});

  const setLayoutY = useCallback((indices: number[], y: number) => {
    indices.forEach((i) => {
      fieldYRef.current[i] = y;
    });
  }, []);

  const registerField = useCallback((index: number) => {
    return {
      onLayout: (e: { nativeEvent: { layout: { y: number } } }) => {
        fieldYRef.current[index] = e.nativeEvent.layout.y;
      },
      onFocus: () => {
        setTimeout(() => {
          const y = fieldYRef.current[index] ?? 0;
          // Leave this much space above the focused input (header + Done bar + padding)
          const spaceAbove = keyboardHeight > 0
            ? HEADER_HEIGHT + DONE_BAR_HEIGHT + 80 + EXTRA_PADDING_ABOVE_INPUT
            : 100;
          const scrollToY = Math.max(0, y - spaceAbove);
          scrollRef.current?.scrollTo({
            y: scrollToY,
            animated: true,
          });
        }, SCROLL_DELAY_MS);
      },
    };
  }, [keyboardHeight]);

  return { scrollRef, registerField, setLayoutY };
}
