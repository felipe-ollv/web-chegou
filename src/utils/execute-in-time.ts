
export class ExecuteInTime {

  static execute(callback: () => void, time: number): () => void {
    const intervalId = setInterval(callback, time);
    return () => clearInterval(intervalId);
  }

  static countdown(onTick: (remaining: number) => void, onEnd: () => void): () => void {
    let remaining = 60;

    const intervalId = setInterval(() => {
      console.log(remaining);
      onTick(remaining);
      remaining--;

      if (remaining < 0) {
        remaining = 60;
        onEnd();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }
}