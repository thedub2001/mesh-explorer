export type ActionDirection = "forward" | "backward";

export interface ActionRecord<TPayload> {
  id: string;
  type: string;
  payload: TPayload;
  timestamp: number;
}

export interface ActionHandler<TPayload> {
  type: string;
  apply: (payload: TPayload, direction: ActionDirection) => Promise<void>;
}

export class ActionLog {
  private readonly actions: ActionRecord<unknown>[] = [];
  private position = -1;
  private readonly handlers = new Map<string, ActionHandler<unknown>>();

  registerHandler<TPayload>(handler: ActionHandler<TPayload>): void {
    this.handlers.set(handler.type, handler as ActionHandler<unknown>);
  }

  record<TPayload>(action: ActionRecord<TPayload>): void {
    if (this.position < this.actions.length - 1) {
      this.actions.splice(this.position + 1);
    }
    this.actions.push(action as ActionRecord<unknown>);
    this.position = this.actions.length - 1;
  }

  async undo(): Promise<void> {
    if (!this.canUndo()) {
      return;
    }
    const action = this.actions[this.position];
    const handler = this.handlers.get(action.type);
    if (!handler) {
      throw new Error(`No handler registered for action ${action.type}`);
    }
    await handler.apply(action.payload, "backward");
    this.position -= 1;
  }

  async redo(): Promise<void> {
    if (!this.canRedo()) {
      return;
    }
    const action = this.actions[this.position + 1];
    const handler = this.handlers.get(action.type);
    if (!handler) {
      throw new Error(`No handler registered for action ${action.type}`);
    }
    await handler.apply(action.payload, "forward");
    this.position += 1;
  }

  canUndo(): boolean {
    return this.position >= 0;
  }

  canRedo(): boolean {
    return this.position < this.actions.length - 1;
  }

  list(): ActionRecord<unknown>[] {
    return [...this.actions];
  }

  clear(): void {
    this.actions.length = 0;
    this.position = -1;
  }
}
