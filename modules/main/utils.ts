export const sleep = (dura: number): Promise<void> => new Promise(resolve => setTimeout(resolve, dura));
