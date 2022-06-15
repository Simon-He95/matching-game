import { computed, ref } from 'vue'
import type { Block } from './type'
export const currentImage = ref<number>(0)
export const base64 = ref<string>('')
export const arrayPic = ref<Array<Block[]>>([])
export const ratio = ref<number>(0)
export const n = ref<number>(0)
export const loading = ref<boolean>(true)
export const emptyFlag = './empty.png'
export const height = computed(() => 1 / ratio.value * 5)
