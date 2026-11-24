interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100%-32px)] glass-surface border-[#B69A67]/40 rounded-xl px-5 py-3 text-xs sm:text-sm font-medium text-[#F1F0EC]"
    >
      {message}
    </div>
  );
}
