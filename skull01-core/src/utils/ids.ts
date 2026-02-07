export type IdPrefix = "graph" | "node" | "relation" | "file" | "type" | "projection" | "blob" | "action";

export interface IdGenerator {
  next(prefix: IdPrefix): string;
}

export class TimeSortableIdGenerator implements IdGenerator {
  private counter = 0;

  next(prefix: IdPrefix): string {
    const time = Date.now().toString(36);
    const count = (this.counter++ % 0xffff).toString(36).padStart(4, "0");
    return `${prefix}_${time}_${count}`;
  }
}
