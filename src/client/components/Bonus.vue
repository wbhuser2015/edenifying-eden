<template>
  <div class='board-space-bonuses'>
    <i v-for="(spaceBonus, idx) in bonus" :key="idx" :class="getClass(idx + 1, spaceBonus)" />
  </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {SpaceBonus} from '@/common/boards/SpaceBonus';

const css: Record<SpaceBonus, string> = {
  [SpaceBonus.TITANIUM]: 'prayer',
  [SpaceBonus.STEEL]: 'theology',
  [SpaceBonus.PLANT]: 'outreach',
  [SpaceBonus.DRAW_CARD]: 'card',
  [SpaceBonus.HEAT]: 'missions',
  [SpaceBonus.OCEAN]: 'bonusUnreached',
  [SpaceBonus.MEGACREDITS]: '', // Only used for Ares
  [SpaceBonus.ANIMAL]: 'animal',
  [SpaceBonus.MICROBE]: 'microbe',
  [SpaceBonus.ENERGY]: 'discipleship',
  [SpaceBonus.DATA]: 'data',
  [SpaceBonus.SCIENCE]: 'science',
  [SpaceBonus.ENERGY_PRODUCTION]: 'discipleship-production',
  [SpaceBonus.TEMPERATURE]: 'bonusgospel_spread',
  [SpaceBonus.ASTEROID]: 'asteroid',
  [SpaceBonus.DELEGATE]: 'delegate',
  [SpaceBonus.COLONY]: 'colony',
  [SpaceBonus._RESTRICTED]: '', // RESTRICTED is just a that a space is empty, not an actual bonus.
};

export default Vue.extend({
  name: 'bonus',
  props: {
    bonus: {
      type: Array as () => Array<SpaceBonus>,
    },
  },
  methods: {
    getClass(idx: number, bonus: SpaceBonus): string {
      const doubleWideBonuses = [
        SpaceBonus.OCEAN,
        SpaceBonus.TEMPERATURE,
        SpaceBonus.COLONY,
      ];
      // If only one bonus is present, center it.
      // Except: some bonuses occupy 2 spaces.
      let position: string | number = idx;
      if (this.bonus.length === 1 && !doubleWideBonuses.includes(bonus)) {
        position = 'only';
      }
      return `board-space-bonus board-space-bonus--${css[bonus]} board-space-bonus-pos--${position}`;
    },
  },
});

</script>

