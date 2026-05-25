/// In-memory x402 subscription store. Lives for the duration of the dev server
/// process — production would persist to a DB and verify payment receipts
/// against the x402 facilitator.

export type Subscription = {
  id: string;
  agentId: string;
  subscriber: string;
  signature: string;
  pricePerActionUsdc: number;
  startedAt: number;
  lastBilledAt: number;
  actionsBilled: number;
  totalBilledUsdc: number;
  active: boolean;
};

class X402Store {
  private subs = new Map<string, Subscription>(); // key: `${subscriber}:${agentId}`

  key(subscriber: string, agentId: string) {
    return `${subscriber.toLowerCase()}:${agentId}`;
  }

  create(input: {
    subscriber: string;
    agentId: string;
    signature: string;
  }): Subscription {
    const id = `sub_${Math.random().toString(36).slice(2, 10)}`;
    const now = Math.floor(Date.now() / 1000);
    const sub: Subscription = {
      id,
      agentId: input.agentId,
      subscriber: input.subscriber,
      signature: input.signature,
      pricePerActionUsdc: 0.05, // $0.05 per agent action
      startedAt: now,
      lastBilledAt: now,
      actionsBilled: 0,
      totalBilledUsdc: 0,
      active: true,
    };
    this.subs.set(this.key(input.subscriber, input.agentId), sub);
    return sub;
  }

  get(subscriber: string, agentId: string): Subscription | undefined {
    return this.subs.get(this.key(subscriber, agentId));
  }

  /// Simulate per-action billing: each call adds N billed actions and updates totals.
  bill(subscriber: string, agentId: string, actionsSinceLastBill: number): Subscription | undefined {
    const sub = this.get(subscriber, agentId);
    if (!sub || !sub.active) return sub;
    sub.actionsBilled += actionsSinceLastBill;
    sub.totalBilledUsdc += actionsSinceLastBill * sub.pricePerActionUsdc;
    sub.lastBilledAt = Math.floor(Date.now() / 1000);
    return sub;
  }

  cancel(subscriber: string, agentId: string): Subscription | undefined {
    const sub = this.get(subscriber, agentId);
    if (sub) sub.active = false;
    return sub;
  }
}

let _store: X402Store | null = null;
export function getX402Store(): X402Store {
  if (!_store) _store = new X402Store();
  return _store;
}
