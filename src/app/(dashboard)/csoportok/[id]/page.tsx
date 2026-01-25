import { MobileGroupDetail } from "@/components/mobile/MobileGroupDetail"

interface Props {
  params: Promise<{ id: string }>
}

export default async function GroupDetailPage({ params }: Props) {
  const { id } = await params
  return <MobileGroupDetail groupId={id} />
}
