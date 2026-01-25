import { MobilePayment } from "@/components/mobile/MobilePayment"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PaymentDetailPage({ params }: Props) {
  const { id } = await params

  return <MobilePayment paymentId={id} />
}
