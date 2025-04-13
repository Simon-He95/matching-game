<script setup lang="ts">
  import { arrayPic, emptyFlag, height, loading, n, ratio } from '../config'
  import { bfs, noMatching, reset } from '../pic'
  import type { Block } from '../type'
  import { baseImage } from '../request'
  const pre = ref<Block>({})
  const gameMessage = ref<{ show: boolean, type: string, message: string }>({ show: false, type: '', message: '' })
  // 添加当前难度状态
  const currentDifficulty = ref<'Easy' | 'Normal' | 'Hard'>('Easy')
  
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
            gameMessage.value = { show: true, type: 'win', message: '恭喜你，游戏胜利！' }
            setTimeout(() => {
              gameMessage.value.show = false
              baseImage()
            }, 2000)
          }, 100)
        }
        else if (noMatching()) {
          setTimeout(() => {
            gameMessage.value = { show: true, type: 'lose', message: '没有可消除的牌了！' }
            setTimeout(() => {
              gameMessage.value.show = false
              reset()
            }, 2000)
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
    // 设置当前选中的难度
    currentDifficulty.value = type
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
      <button class="game-btn easy" :class="{ 'active': currentDifficulty === 'Easy' }" @click="newGame('Easy')">简单</button>
      <button class="game-btn normal" :class="{ 'active': currentDifficulty === 'Normal' }" @click="newGame('Normal')">普通</button>
      <button class="game-btn hard" :class="{ 'active': currentDifficulty === 'Hard' }" @click="newGame('Hard')">困难</button>
    </div>
    <div class="game-board">
      <div v-for="(row, y) in arrayPic" :key="y" class="game-row" :class="{ 'empty-row': isRowEmpty(row) }" :style="{
        height: y === 0 ? 0 : 'auto',
      }">
        <div v-for="block in row" :key="`${block.pos},x:${block.x},y:${block.y}`" class="game-card" :class="[
          block?.animate ? 'animate' : '',
          block?.disappear ? 'animate-fade-out disappear' : '',
          block?.url === emptyFlag ? 'empty' : '',
        ]" @click="match(block)">
          <img :src="block?.url" :title="block.pos" :style="sizeStyle(block)">
        </div>
      </div>
    </div>
    <div v-if="gameMessage.show" class="game-message" :class="gameMessage.type"> {{ gameMessage.message }} </div>
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

  .game-btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    background-color: #e2e8f0;
    color: #2d3748;
  }

  /* 在常规状态下为每个按钮设置基础颜色 */
  .game-btn.reset {
    background-color: #cbd5e0;
    color: #1a202c;
  }

  .game-btn.new-game {
    background-color: #bee3f8;
    color: #2c5282;
  }

  .game-btn.easy {
    background-color: #c6f6d5;
    color: #276749;
  }

  .game-btn.normal {
    background-color: #c3dafe;
    color: #434190;
  }

  .game-btn.hard {
    background-color: #feebc8;
    color: #7b341e;
  }

  .game-btn:hover {
    filter: brightness(0.95);
  }

  .game-btn.active {
    color: white;
    transform: scale(1.05);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  /* 根据按钮类型设置对应的激活状态背景色 */
  .game-btn.reset.active {
    background-color: #718096;
    border-color: #4a5568;
  }

  .game-btn.new-game.active {
    background-color: #3182ce;
    border-color: #2b6cb0;
  }

  .game-btn.easy.active {
    background-color: #48bb78;
    border-color: #38a169;
  }

  .game-btn.normal.active {
    background-color: #4299e1;
    border-color: #3182ce;
  }

  .game-btn.hard.active {
    background-color: #ed8936;
    border-color: #dd6b20;
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
  }

  .game-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 1rem 2rem;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 0.5rem;
    text-align: center;
    z-index: 1000;
  }

  .game-message.win {
    background-color: green;
  }

  .game-message.lose {
    background-color: red;
  }
</style>
