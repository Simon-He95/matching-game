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

  // 判断一行是否全部都是空图片
  const isRowEmpty = (row: Block[]) => {
    return row.every(block => block.url === emptyFlag)
  }
</script>
<template>
  <div class="game-container">
    <div class="game-controls" m-y-5 flex="~ gap-2 wrap" justify-center>
      <button class="game-btn reset" @click="reset">重置</button>
      <button class="game-btn new-game" @click="baseImage">新游戏</button>
      <button class="game-btn easy" @click="newGame('Easy')">简单</button>
      <button class="game-btn normal" @click="newGame('Normal')">普通</button>
      <button class="game-btn hard" @click="newGame('Hard')">困难</button>
    </div>
    
    <div class="game-board">
      <div v-for="(row, y) in arrayPic" :key="y" class="game-row" 
        :class="{ 'empty-row': isRowEmpty(row) }"
        >
        <div v-for="block in row" :key="`${block.pos},x:${block.x},y:${block.y}`" 
          class="game-card" 
          :class="[
            block?.animate ? 'animate' : '',
            block?.disappear ? 'animate-fade-out disappear' : '',
            block?.url === emptyFlag ? 'empty' : '',
          ]"
          @click="match(block)">
          <img :src="block?.url" :title="block.pos" :style="sizeStyle(block)">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-card {
  margin: 0.5rem;
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-controls {
  margin-bottom: 1.5rem;
}

/* 确保图片保持其比例并居中 */
.game-card img {
  transition: transform 0.3s ease;
  max-width: 100%;
  max-height: 100%;
  margin: auto;
}

/* 当行中所有图片都是空的时候禁用鼠标事件 */
.empty-row {
  pointer-events: none;
  height: 0;
}
</style>
