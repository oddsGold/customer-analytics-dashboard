import React from "react";

interface PayOrderTemplateProps {
    orderId: number;
    totalAmount: number;
    paymentUrl: string;
}

const PayOrderTemplate: React.FC<PayOrderTemplateProps> = ({ orderId, totalAmount, paymentUrl }) => {
    return (
        <div>
            <h1>Order #{orderId}</h1>
            <p>
                Pay for the order in the amount of <b>${totalAmount}</b>. Follow{" "}
                <a href={paymentUrl}>this link</a> to pay for your order.
            </p>
        </div>
    );
};

export default PayOrderTemplate;
