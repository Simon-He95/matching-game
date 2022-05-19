import { ref } from 'vue'
import { Block } from './type'
export const currentImage = ref<number>(0)
export const base64 = ref<string>('')
export const arrayPic = ref<Block[]>([])
export const ratio = ref<string>('1.5')
export const n = ref<number>(10)
export const loading = ref<boolean>(true)
