import { useEffect, useRef } from "react";

export default function PayPal({amount, onSuccess}) {
  const paypal = useRef()
  useEffect(() => {
    window.paypal
      .Buttons({
        createOrder: (data, actions, err) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                description: "Cool looking table",
                amount: {
                  value: amount,
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          console.log(order)
          if (order && order.status) {
            onSuccess()
          }
        },
        onError: (err) => {
          console.log(err);
        },
      })
      .render(paypal.current);
  }, [amount, onSuccess]);
  return (
    <div ref={paypal}></div>
  );
}
