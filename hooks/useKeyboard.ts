import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

/**
 * Listens to keyboard show/hide and returns height + visibility.
 * Use for: extra ScrollView padding so inputs stay visible, and showing a "Done"/"OK" button to dismiss.
 */
export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const show = (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsVisible(true);
    };
    const hide = () => {
      setKeyboardHeight(0);
      setIsVisible(false);
    };

    const subShow = Keyboard.addListener('keyboardDidShow', show);
    const subHide = Keyboard.addListener('keyboardDidHide', hide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const dismiss = () => Keyboard.dismiss();

  return { keyboardHeight, isKeyboardVisible: isVisible, dismiss };
}
