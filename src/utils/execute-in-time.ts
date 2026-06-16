
export class ExecuteInTime {

  static execute(callback: () => void, time: number): () => void {
    const intervalId = setInterval(callback, time);
    return () => clearInterval(intervalId);
  }
}
