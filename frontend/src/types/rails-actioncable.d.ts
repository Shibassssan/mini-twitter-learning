declare module '@rails/actioncable' {
  export interface Subscription {
    unsubscribe(): void
    perform(action: string, data?: Record<string, unknown>): void
  }

  export interface Subscriptions {
    create(
      mixin: Record<string, unknown>,
      callbacks: Record<string, (...args: unknown[]) => void>,
    ): Subscription
  }

  export interface Consumer {
    subscriptions: Subscriptions
    disconnect(): void
  }

  export function createConsumer(url?: string): Consumer
}
