import { arrayPic, emptyFlag, loading } from './config'
import type { Block } from './type'

const pictureMap = new Map<string, any>()

function splitImage(n: number, src: string) {
  const key = `${n}-${src}`
  return new Promise((resolve) => {
    if (pictureMap.has(key))
      return resolve(pictureMap.get(key))

    const image = new Image()
    image.src = src

    image.onload = async() => {
      const result = generateImage(image, n)
      pictureMap.set(key, result)
      resolve(result)
    }
  })
}

async function generateImage(image: any, n: number) {
  const numbers: any[] = []
  const result: any[] = []
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const w = image.width / n
  const h = image.height / n
  const cacheUrl = new Map<string, string>()
  for (let j = 0; j <= 2 * n + 1; j++) {
    const col = []
    for (let i = 0; i <= n + 1; i++) {
      if (i === 0 || i === n + 1 || j === 0 || j === 2 * n + 1) {
        col.push({
          url: emptyFlag,
          x: i,
          y: j,
        })
        continue
      }
      let pos = ''

      if (j > n)
        pos = JSON.stringify([i - 1, j - n - 1])
      else
        pos = JSON.stringify([i - 1, j - 1])

      let url = ''
      if (cacheUrl.has(pos)) {
        url = cacheUrl.get(pos)!
      }
      else {
        ctx.drawImage(image, (i - 1) * w, (j - 1) * h, w, h, 0, 0, w, h)
        url = await PicSpace(canvas.toDataURL('image/png')) as string
        cacheUrl.set(pos, url)
      }
      const block = {
        url,
        x: i,
        y: j,
        pos: j > n
          ? i - 1 + (j - n - 1) * n
          : i - 1 + (j - 1) * n,
      }

      numbers.push(JSON.parse(JSON.stringify(block)))
      col.push(block)
    }
    result.push(col)
  }
  return { result, numbers }
}

async function PicSpace(src: string) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const imgData = ctx?.getImageData(0, 0, canvas.width, canvas.height)?.data
      let lOffset = canvas.width; let rOffset = 0; let tOffset = canvas.height; let bOffset = 0
      for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
          const pos = (i + canvas.width * j) * 4
          if (imgData?.[pos] === 255 || imgData?.[pos + 1] === 255 || imgData?.[pos + 2] || imgData?.[pos + 3]) {
            bOffset = Math.max(j, bOffset)
            tOffset = Math.min(j, tOffset)
            lOffset = Math.min(i, lOffset)
            rOffset = Math.max(i, rOffset)
          }
        }
      }
      lOffset++
      rOffset++
      tOffset++
      bOffset++
      const canvas1 = document.createElement('canvas')
      const ctx1 = canvas1.getContext('2d')
      canvas1.width = rOffset - lOffset
      canvas1.height = bOffset - tOffset
      ctx1?.drawImage(img, lOffset, tOffset, canvas1.width, canvas1.height, 0, 0, canvas1.width, canvas1.height)
      resolve(canvas1.toDataURL())
    }
  })
}

function randomPic(numbers: any[]) {
  const result = numbers.splice(Math.floor(Math.random() * numbers.length), 1)[0]
  return result
}
export async function initData(n: number, src: string) {
  const { result: array, numbers } = await splitImage(n, src) as any
  const copyNumbers = JSON.parse(JSON.stringify(numbers))
  const copyArrayPic = JSON.parse(JSON.stringify(array))
  let targetMap: Record<number, any> | null = {}
  
  // Track attempts to avoid infinite loops
  let attempts = 0
  let hasSolution = false
  
  // Keep trying until we generate a solvable layout or reach max attempts
  while (!hasSolution && attempts < 10) {
    attempts++
    
    // Reset state for a fresh attempt
    const freshNumbers = JSON.parse(JSON.stringify(numbers))
    const freshArrayPic = JSON.parse(JSON.stringify(array))
    targetMap = {}
    
    // Generate a new layout
    for (let i = 1; i < array.length - 1; i++) {
      for (let j = 1; j < array[i].length - 1; j++) {
        const { url, pos } = randomPic(freshNumbers)
        if (targetMap[pos] === undefined)
          targetMap[pos] = freshArrayPic[i][j]
        else
          freshArrayPic[i][j].target = targetMap[pos]

        freshArrayPic[i][j].url = url
        freshArrayPic[i][j].pos = pos
      }
    }
    
    // Update the array and check if it's solvable
    arrayPic.value = freshArrayPic
    hasSolution = !noMatching()
    
    // If we have a solution, keep this layout
    if (hasSolution) {
      targetMap = null
      break
    }
  }
  
  // If we couldn't generate a solvable puzzle after max attempts,
  // use the last generated layout and let the reset function handle it
  if (!hasSolution) {
    console.warn('Could not generate a solvable puzzle after multiple attempts')
    reset()
  }
}

export function reset() {
  loading.value = true
  
  // Track attempts to avoid infinite loops
  let attempts = 0
  let hasSolution = false
  
  while (!hasSolution && attempts < 10) {
    attempts++
    
    const numbers: any[] = []
    const copyArrayPic: Array<Block[]> = JSON.parse(JSON.stringify(arrayPic.value))
    const targetMap: Record<number, any> = {}
    
    // Collect all non-empty blocks
    arrayPic.value.forEach((row) => {
      row.forEach((block) => {
        if (block.url !== emptyFlag)
          numbers.push(block)
      })
    })
    
    // Random reassignment
    copyArrayPic.forEach((row, i) => {
      row.forEach((block, j) => {
        if (block.url !== emptyFlag) {
          const { url, pos } = randomPic(numbers)
          delete block.target
          if (targetMap[pos] === undefined)
            targetMap[pos] = copyArrayPic[i][j]
          else
            block.target = targetMap[pos]

          block.url = url
          block.pos = pos
        }
      })
    })
    
    // Update array and check if it's solvable
    arrayPic.value = copyArrayPic
    hasSolution = !noMatching()
    
    // If we have a solution, keep this layout
    if (hasSolution) {
      loading.value = false
      break
    }
  }
  
  // If we still don't have a solution after max attempts, try one more time with a different approach
  if (!hasSolution) {
    console.warn('Could not generate a solvable puzzle after multiple reset attempts')
    // We could implement a more deterministic approach here if needed
    loading.value = false
  }
}

export function noMatching() {
  // 判断是否无解了
  const array: Block[] = []
  arrayPic.value.forEach((row) => {
    row.forEach((block) => {
      if (block.target && block.url !== emptyFlag)
        array.push(block)
    })
  })
  return array.every(block => !bfs(block, block.target!))
}

function preReturn(block: Block | null) {
  if (!block)
    return false

  let count = 0
  let pre = null
  let cur = null
  if (block.types!.length < 4)
    return true

  for (let i = 1; i < block.types!.length; i++) {
    cur = block.types![i]
    pre = block.types![i - 1]
    if (pre !== cur)
      count++

    if (count > 2)
      return false
  }
  return true
}

function sameBlock(block: Block, target: Block) {
  return block.pos === target.pos && block.x === target.x && block.y === target.y
}

export function bfs(block: Block, target: Block, map = new Set()) {
  const queue = [block]
  const maxHeight = arrayPic.value[0].length - 1
  const maxWidth = arrayPic.value.length - 1
  while (queue.length) {
    const cur: Block = queue.shift()!
    if (map.has(cur))
      continue

    map.add(cur)
    const y = cur.y
    const x = cur.x
    const types: string[] = cur.types || []
    const top = y > 0 ? JSON.parse(JSON.stringify(arrayPic.value[y - 1][x])) : null
    const bottom = y < maxWidth ? JSON.parse(JSON.stringify(arrayPic.value[y + 1][x])) : null
    const left = x > 0 ? JSON.parse(JSON.stringify(arrayPic.value[y][x - 1])) : null
    const right = x < maxHeight ? JSON.parse(JSON.stringify(arrayPic.value[y][x + 1])) : null
    pushTypes(top, types, 'down')
    pushTypes(bottom, types, 'up')
    pushTypes(left, types, 'right')
    pushTypes(right, types, 'left')

    // 处理边界
    if (preReturn(top) && (block.x !== target.x || block.y > target.y)) {
      if (sameBlock(top, target))
        return true

      if (top.url === emptyFlag)
        queue.push(top)
    }
    if (preReturn(bottom) && (block.x !== target.x || block.y < target.y)) {
      if (sameBlock(bottom, target))
        return true

      if (bottom.url === emptyFlag)
        queue.push(bottom)
    }
    if (preReturn(left) && (block.y !== target.y || block.x > target.x)) {
      if (sameBlock(left, target))
        return true

      if (left.url === emptyFlag)
        queue.push(left)
    }
    if (preReturn(right) && (block.y !== target.y || block.x < target.x)) {
      if (sameBlock(right, target))
        return true

      if (right.url === emptyFlag)
        queue.push(right)
    }
  }
  return false
}

function pushTypes(block: Block | null, types: string[], type: string) {
  if (!block)
    return
  block.types = types ? [type, ...types] : [type]
}
