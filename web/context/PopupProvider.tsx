import { createContext, useContext, useState, type ReactNode } from "react";

interface PopupContextType {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  showPopup: (onConfirm: () => void, onCancel: () => void,content:string) => void;
  hidePopup: () => void;
  content:string
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState<() => void>(() => {});
  const [cancelCallback, setCancelCallback] = useState<() => void>(() => {});
  const [content, setContent] = useState("Do you want to open it?");
  // 展示弹窗并传递确认和取消回调
  const showPopup = (onConfirm: () => void, onCancel: () => void,content:string) => {
    setConfirmCallback(() => onConfirm);
    setCancelCallback(() => onCancel);
    setIsOpen(true);
    setContent(content);
  };

  // 隐藏弹窗
  const hidePopup = () => {
    setIsOpen(false);
  };

  // 确认回调
  const handleConfirm = () => {
    confirmCallback(); // 执行确认操作
    hidePopup(); // 关闭弹窗
  };

  // 取消回调
  const handleCancel = () => {
    cancelCallback(); // 执行取消操作
    hidePopup(); // 关闭弹窗
  };

  const value = {
    isOpen,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
    showPopup,
    hidePopup,
    content
  };

  return <PopupContext.Provider value={value}>{children}</PopupContext.Provider>;
}

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
};
