import React from "react";

export const Modal: React.FC<{
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}> = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-[5px] bg-white p-6 shadow-xl dark:bg-gray-dark">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    &times;
                </button>
                <h3 className="text-lg font-semibold">{title}</h3>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
};

