export const sleep = (dura: number) => new Promise<void>(resolve => setTimeout(resolve, dura));
