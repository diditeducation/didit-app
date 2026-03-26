import { useState, useRef } from 'react';

export function useToast() {
  const [toast, setToast] = useState({
    message: '',
    visible: false,
    topPercent: 35,
    duration: 1500,
  });
  const timerRef = useRef(null);

  const showToast = (message, duration = 1500, topPercent = 35) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, visible: true, topPercent, duration });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      timerRef.current = null;
    }, duration);
  };

  return { toast, showToast };
}
