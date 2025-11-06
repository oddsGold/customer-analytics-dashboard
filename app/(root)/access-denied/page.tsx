import {InfoBlock} from "@/shared/components/shared";

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center mt-40">
            <InfoBlock
                title="Access denied"
                text="Перегляд цієї сторінки обмежено. (Потрібні права доступу)"
                imageUrl="/assets/images/lock.png"
            />
        </div>
    );
}