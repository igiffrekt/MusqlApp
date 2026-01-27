import { useUpgradePrompt } from '@/components/UpgradePrompt'

interface LimitErrorDetails {
  current: number
  limit: number
  limitType: string
  currentTier: string
  suggestedTier?: string
  suggestedTierName?: string
}

interface LimitErrorResponse {
  error: 'LIMIT_EXCEEDED'
  message: string
  details: LimitErrorDetails
}

export function isLimitError(data: unknown): data is LimitErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    (data as { error: string }).error === 'LIMIT_EXCEEDED'
  )
}

export function useLimitErrorHandler() {
  const { show } = useUpgradePrompt()

  const handleLimitError = (data: LimitErrorResponse) => {
    show({
      currentTier: data.details.currentTier,
      suggestedTier: data.details.suggestedTier,
      suggestedTierName: data.details.suggestedTierName,
      limitType: data.details.limitType,
      current: data.details.current,
      limit: data.details.limit,
      message: data.message,
    })
  }

  return { handleLimitError, isLimitError }
}
