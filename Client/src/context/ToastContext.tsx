import { createContext, useCallback, useContext, useState } from "react";

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { id, type, message }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast toast-top toast-center z-100">
        {toasts.map((toast) => {
          const alertClasses = {
            success: "alert-success",
            error: "alert-error",
            info: "alert-info",
            warning: "alert-warning",
          };

          return (
            <div
              key={toast.id}
              className={`alert ${alertClasses[toast.type]} shadow-lg text-white`}
            >
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);

  if (context === undefined)
    throw new Error("useToast must be used within a ToastProvider");

  return context;
}