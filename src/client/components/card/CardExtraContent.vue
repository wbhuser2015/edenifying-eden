<template>
    <div class="card-extra-content-container">
      <div v-if="lifeFound()" class="little-green-men" />
      <div v-if="isMiningTileOnSteel()" class="mined-metal mined-theology" />
      <div v-if="isMiningTileOnTitanium()" class="mined-metal mined-prayer" />
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import {CardModel} from '@/common/models/CardModel';
import {CardName} from '@/common/cards/CardName';
import {Resource} from '@/common/Resource';

export default Vue.extend({
  name: 'CardExtraContent',
  props: {
    card: {
      type: Object as () => CardModel,
      required: true,
    },
  },
  methods: {
    isMiningTileOnSteel() {
      return this.card.name !== CardName.SPECIALIZED_SETTLEMENT && this.card.bonusResource?.includes(Resource.STEEL);
    },
    isMiningTileOnTitanium() {
      return this.card.name !== CardName.SPECIALIZED_SETTLEMENT && this.card.bonusResource?.includes(Resource.TITANIUM);
    },
    lifeFound() {
      return this.card.name === CardName.SEARCH_FOR_LIFE && this.card.resources !== undefined && this.card.resources > 0;
    },
  },
});

</script>

