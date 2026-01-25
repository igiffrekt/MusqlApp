import { MobilePayment } from "@/components/mobile/MobilePayment"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaymentDetailPage({ params }: Props) {
  const { id } = await params

  // In production, fetch payment details from API
  // const payment = await fetch(`/api/payments/${id}`).then(res => res.json())

  return <MobilePayment />
}
