import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean; // 控制弹窗是否显示
  onSubmit: (name: string) => void; // 提交表单的回调函数
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onSubmit }) => {
  const [name, setName] = React.useState("");

  useEffect(() => {
    if (isOpen) {
      console.log("Modal is automatically triggered");
    }
  }, [isOpen]);

  if (!isOpen) return null; // 如果弹窗未打开，则不渲染

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(name); // 调用父组件传递的提交回调
    setName(""); // 清空输入框
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 w-full max-w-md">
        <div className="text-center">
          <h1 className="mt-4 text-3xl font-DynaPuff text-red-600">Welcome</h1>
          <h2 className="mt-4 text-xl font-DynaPuff text-red-400">Enter your name to start your luck!</h2>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex justify-center">
            <div className="flex items-center">
              <input
                type="text"
                id="username"
                name="username"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-1 border border-black border-2 rounded-md w-40"
              />
            </div>
          </div>
          <div className="flex justify-center"> 
            <button
              type="submit"
              className="w-60 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-DynaPuff text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};