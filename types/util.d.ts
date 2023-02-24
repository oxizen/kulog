declare type Keys<T> = (keyof T)[];
declare type Values<T> = (T[keyof T])[];
declare type Entries<T> = {
  [P in keyof T]: [P, T[P]]
}[keyof T][];

declare type NumberString = number | string;

declare type ObjectLiteral<T = any> = {
  [P: string]: T;
};
declare type Point = { x: number, y: number };