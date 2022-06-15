export interface Block {
  x: number
  y: number
  pos: number
  animate: boolean | undefined
  disappear: boolean | undefined
  url: string
  target?: Block
  types: string[]
}
