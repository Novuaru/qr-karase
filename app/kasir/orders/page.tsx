'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import {
  PDFDownloadLink,
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

interface OrderItem {
  id: string
  name_snapshot: string
  price_snapshot: number
  quantity: number
  size: string
}

interface Order {
  id: string
  status: string
  total: number
}

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
    fontFamily: 'Courier',
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#888',
    borderBottomStyle: 'solid',
    paddingBottom: 3,
    marginBottom: 3,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cellName: {
    flex: 3,
  },
  cellSize: {
    flex: 1,
    textAlign: 'center',
  },
  cellPrice: {
    flex: 2,
    textAlign: 'right',
  },
  cellQty: {
    flex: 1,
    textAlign: 'center',
  },
  cellSubtotal: {
    flex: 2,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#888',
    borderTopStyle: 'solid',
    paddingTop: 5,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 8,
  },
})

function ReceiptDocument({
  order,
  orderItems,
}: {
  order: Order
  orderItems: OrderItem[]
}) {
  const totalCalculated = orderItems.reduce(
    (sum, item) => sum + item.price_snapshot * item.quantity,
    0
  )

  return (
    <Document>
      <Page size="A6" style={styles.page}>
        <View style={styles.header}>
          <Text>STRUK PEMESANAN</Text>
          <Text>Order ID: {order.id}</Text>
          <Text>Status: {order.status}</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.cellName}>Nama</Text>
          <Text style={styles.cellSize}>Ukuran</Text>
          <Text style={styles.cellPrice}>Harga</Text>
          <Text style={styles.cellQty}>Qty</Text>
          <Text style={styles.cellSubtotal}>Subtotal</Text>
        </View>

        {orderItems.map((item) => {
          const subtotal = item.price_snapshot * item.quantity
          return (
            <View style={styles.tableRow} key={item.id}>
              <Text style={styles.cellName}>
                {item.name_snapshot}
              </Text>
              <Text style={styles.cellSize}>{item.size}</Text>
              <Text style={styles.cellPrice}>
                Rp{item.price_snapshot.toLocaleString('id-ID')}
              </Text>
              <Text style={styles.cellQty}>{item.quantity}</Text>
              <Text style={styles.cellSubtotal}>
                Rp{subtotal.toLocaleString('id-ID')}
              </Text>
            </View>
          )
        })}

        <View style={styles.totalRow}>
          <Text>Total</Text>
          <Text>Rp{totalCalculated.toLocaleString('id-ID')}</Text>
        </View>

        <Text style={styles.footer}>Terima kasih telah memesan!</Text>
      </Page>
    </Document>
  )
}

export default function OrderDetailPage() {
  const supabase = createClientComponentClient()
  const params = useParams()
  const orderId = params.order_id

  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true)
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (orderError) throw orderError
        if (!orderData) throw new Error('Order tidak ditemukan')

        setOrder(orderData)

        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('id, name_snapshot, price_snapshot, quantity, size')
          .eq('order_id', orderId)

        if (itemsError) throw itemsError
        setOrderItems(itemsData ?? [])
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data pesanan')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, supabase])

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500 text-lg font-medium">
        Memuat data pesanan...
      </div>
    )

  if (error)
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Error loading order: {error}
      </div>
    )

  if (!order)
    return (
      <div className="p-6 text-center text-gray-700 font-semibold">
        Pesanan tidak ditemukan.
      </div>
    )

  return (
    <main className="p-6 max-w-3xl mx-auto font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 border-b border-gray-300 pb-3 text-gray-900">
        Detail Pesanan & Cetak Struk PDF
      </h1>

      {/* Preview PDF di halaman */}
      <PDFViewer width="100%" height={400}>
        <ReceiptDocument order={order} orderItems={orderItems} />
      </PDFViewer>

      {/* Tombol download */}
      <div className="mt-4 text-center">
        <PDFDownloadLink
          document={<ReceiptDocument order={order} orderItems={orderItems} />}
          fileName={`struk-order-${order.id}.pdf`}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition font-semibold"
        >
          {({ loading }) => (loading ? 'Mempersiapkan PDF...' : 'Download Struk PDF')}
        </PDFDownloadLink>
      </div>
    </main>
  )
}
