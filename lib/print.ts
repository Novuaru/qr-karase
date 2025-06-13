import { formatRupiah } from "./utils";

export function printStruk(order: {
  order_id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}) {
  const win = window.open("", "PRINT", "height=400,width=600");

  if (!win) return;

  win.document.write(`<pre>`);
  win.document.write(`\n     STRUK PEMBAYARAN\n`);
  win.document.write(`Order ID: ${order.order_id}\n`);
  win.document.write(`-------------------------------\n`);

  order.items.forEach((item) => {
    win?.document.write(
      `${item.name} x${item.quantity} .... ${formatRupiah(
        item.price * item.quantity
      )}\n`
    );
  });

  win.document.write(`-------------------------------\n`);
  win.document.write(`TOTAL ............ ${formatRupiah(order.total)}\n`);
  win.document.write(`\nTerima kasih!\n`);
  win.document.write(`</pre>`);

  win.document.close();
  win.focus();
  win.print();
  win.close();
}
