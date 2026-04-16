import { createConsumer, type Consumer } from '@rails/actioncable'
import { useAuthStore } from '@/lib/stores/authStore'

let cable: Consumer | null = null
let cachedToken: string | undefined

function disconnectCable() {
  cable?.disconnect()
  cable = null
  cachedToken = undefined
}

useAuthStore.subscribe((state, prev) => {
  const next = state.accessToken ?? ''
  const before = prev.accessToken ?? ''
  if (next !== before) {
    disconnectCable()
  }
})

function ensureCable(): Consumer {
  const token = useAuthStore.getState().accessToken ?? ''
  if (cable && cachedToken === token) {
    return cable
  }
  disconnectCable()
  cachedToken = token
  const qs = token ? `?token=${encodeURIComponent(token)}` : ''
  cable = createConsumer(`/cable${qs}`)
  return cable
}

/**
 * Proxy so ActionCableLink always uses a consumer whose URL matches the current access token.
 */
export function getActionCableConsumer(): Consumer {
  return new Proxy({} as Consumer, {
    get(_target, prop, _receiver) {
      const instance = ensureCable()
      const value = Reflect.get(instance, prop, instance)
      if (typeof value === 'function') {
        return value.bind(instance)
      }
      return value
    },
  })
}
