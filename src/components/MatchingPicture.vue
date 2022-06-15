<script setup lang="ts">
import { arrayPic, emptyFlag, height, loading, n, ratio } from '../config'
import { bfs, noMatching, reset } from '../pic'
import type { Block } from '../type'
import { baseImage } from '../request'
const pre = ref<Block>({})
function match(block: Block) {
  noMatching()
  if (block.url === emptyFlag) return
  if (pre.value === block) {
    pre.value.animate = false
    pre.value = {}
    return
  }
  block.animate = true
  if (pre.value.url !== block.url && pre.value.pos !== block.pos) {
    pre.value.animate = false
    pre.value = block
    return
  }

  if (canEliminate(block)) {
    block.disappear = true
    pre.value.disappear = true
    const _pre = pre.value
    setTimeout(() => {
      block.url = emptyFlag
      _pre.url = emptyFlag
      block.disappear = false
      _pre.disappear = false
      if (isWin()) {
        setTimeout(() => {
          baseImage()
          window.alert('You Win!')
        }, 100)
      }
      else if (noMatching()) {
        setTimeout(() => {
          window.alert('You Lose! no matching')
        }, 100)
      }
    }, 200)
  }
  block.animate = false
  pre.value.animate = false
  pre.value = {}
}

function canEliminate(block: Block) {
  return bfs(block, pre.value)
}

function preReturn(block) {
  let count = 0
  let pre = null
  let cur = null
  if (block.types.length < 4) return true

  for (let i = 1; i < block.types.length; i++) {
    cur = block.types[i]
    pre = block.types[i - 1]
    if (pre !== cur) count++

    if (count > 2) return false
  }
  return true
}

function isWin() {
  return (
    arrayPic.value.reduce(
      (pre, row) => pre + row.filter(block => block.url !== emptyFlag).length,
      0,
    ) <= 2
  )
}

const sizeStyle = (block) => {
  const result = {}
  if (block.animate) result.transform = 'scale(1.1)'

  result.width = '5rem !important'
  result.height = 'auto !important'
  if (block.url === emptyFlag) result.visibility = 'hidden'

  result['aspect-ratio'] = ratio.value
  return result
}

function newGame(type: 'Easy' | 'Normal' | 'Hard') {
  if (type === 'Easy' && n.value !== 2) {
    n.value = 2
    baseImage()
  }
  else if (type === 'Normal' && n.value !== 3) {
    n.value = 3
    baseImage()
  }
  else if (type === 'Hard' && n.value !== 4) {
    n.value = 4
    baseImage()
  }
}
newGame('Easy')
</script>

<template>
  <div m-y-5 flex="~ gap-1" justify-center>
    <button btn @click="reset">
      Rest
    </button>
    <button btn @click="baseImage">
      New Game
    </button>
    <button btn @click="newGame('Easy')">
      Easy
    </button>
    <button btn @click="newGame('Normal')">
      Normal
    </button>
    <button btn @click="newGame('Hard')">
      Hard
    </button>
  </div>
  <div
    v-for="(row, y) in arrayPic"
    :key="y"
    flex="~"
    items-center
    justify-center
    ma
    :style="{
      'margin-bottom': !loading && y === 2 * n + 1 ? -height + 'rem' : '',
      'margin-top': !loading && y === 0 && -height + 'rem',
    }"
  >
    <img
      v-for="block in row"
      :key="block.pos"
      m-1
      object-fill
      w-auto
      flex="~"
      items-center
      justify-center
      :title="block.pos"
      :class="[
        'bg-gray-500/10',
        'hover:bg-gray-500/20',
        block?.disappear ? 'animate-fade-out' : '',
      ]"
      :src="block?.url"
      :style="sizeStyle(block)"
      @click="match(block)"
    >
  </div>
</template>

<style scoped></style>
