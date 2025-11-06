'use client';

import React, {useState} from "react";
import toast from "react-hot-toast";
import {Button} from "@/shared/components/ui";
import {Modal} from "@/shared/components/shared/modal";

export const DeleteConfirmModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    itemName: string;
}> = ({ isOpen, onClose, onConfirm, itemName }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
            toast.success(`'${itemName}' успішно видалено.`);
            onClose();
        } catch (e: any) {
            toast.error(`Помилка: ${e.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal title="Підтвердити видалення" isOpen={isOpen} onClose={onClose}>
            <p>Ви впевнені, що хочете видалити <strong>{itemName}</strong>? Цю дію неможливо скасувати.</p>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" className="rounded-[5px]" onClick={onClose} disabled={isDeleting}>
                    Скасувати
                </Button>
                <Button variant="secondary" className="rounded-[5px]" onClick={handleConfirm} disabled={isDeleting}>
                    {isDeleting ? 'Видалення...' : 'Видалити'}
                </Button>
            </div>
        </Modal>
    );
};