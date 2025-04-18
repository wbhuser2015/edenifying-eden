<template>
    <div class="cards-filter">
        <h2 v-i18n>{{ title }}</h2>
        <div class="cards-filter-results-cont" v-if="selectedCardNames.length">
            <div class="cards-filter-result" v-for="cardName in selectedCardNames" v-bind:key="cardName">
                <label>{{ cardName }}
                  <i class="create-game-expansion-icon expansion-icon-prelude" title="This card is prelude" v-if="isPrelude(cardName)"></i>
                  <i class="create-game-expansion-icon expansion-icon-ceo" title="This card is CEO" v-if="isCEO(cardName)"></i>
                </label>
                <AppButton size="small" type="close" @click="removeCard(cardName)" />
            </div>
        </div>
        <div class="cards-filter-input">
            <div>
                <input class="form-input" :placeholder="$t(this.hint)" v-model="searchTerm" />
            </div>
            <div class="cards-filter-suggest" v-if="foundCardNames.length">
                <div class="cards-filter-suggest-item" v-for="cardName in foundCardNames" v-bind:key="cardName">
                    <a href="#" v-on:click.prevent="addCard(cardName)">
                      {{ cardName }}
                      <i class="create-game-expansion-icon expansion-icon-prelude" title="This card is prelude" v-if="isPrelude(cardName)"></i>
                      <i class="create-game-expansion-icon expansion-icon-ceo" title="This card is CEO" v-if="isCEO(cardName)"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {CardName} from '@/common/cards/CardName';
import AppButton from '@/client/components/common/AppButton.vue';
import {byType, getCard, getCards} from '@/client/cards/ClientCardManifest';
import {CardType} from '@/common/cards/CardType';
import {toName} from '@/common/utils/utils';

const allItems: Array<CardName> = [
  ...getCards(byType(CardType.AUTOMATED)),
  ...getCards(byType(CardType.ACTIVE)),
  ...getCards(byType(CardType.EVENT)),
  ...getCards(byType(CardType.CEO)),
].map(toName)
  .sort((a, b) => a.localeCompare(b));

interface CardsFilterModel {
    selectedCardNames: Array<CardName>;
    foundCardNames: Array<CardName>;
    searchTerm: string;
}

export default Vue.extend({
  name: 'CardsFilter',
  props: {
    title: {
      type: String,
      required: true,
    },
    hint: {
      type: String,
      required: true,
    },
  },
  data(): CardsFilterModel {
    return {
      selectedCardNames: [],
      foundCardNames: [],
      searchTerm: '',
    };
  },
  components: {
    AppButton,
  },
  methods: {
    isPrelude(cardName: CardName) {
      return getCard(cardName)?.type === CardType.PRELUDE;
    },
    isCEO(cardName: CardName) {
      return getCard(cardName)?.type === CardType.CEO;
    },
    removeCard(cardNameToRemove: CardName) {
      this.selectedCardNames = this.selectedCardNames.filter((curCardName) => curCardName !== cardNameToRemove).sort();
    },
    addCard(cardNameToAdd: CardName) {
      if (this.selectedCardNames.includes(cardNameToAdd)) return;
      this.selectedCardNames.push(cardNameToAdd);
      this.selectedCardNames.sort();
      this.searchTerm = '';
    },
  },
  watch: {
    selectedCardNames(value) {
      this.$emit('cards-list-changed', value);
    },
    searchTerm(value: string) {
      if (value === '') {
        this.foundCardNames = [];
        return;
      }
      if (value.indexOf(',') !== -1) {
        const cardNames = new Set(value.split(',').map((c) => c.trim()));
        for (const item of allItems) {
          if (cardNames.has(item)) {
            this.addCard(item);
          }
        }
        return;
      }
      const newCardNames = allItems.filter(
        (candidate: CardName) => ! this.selectedCardNames.includes(candidate) && candidate.toLowerCase().indexOf(value.toLowerCase()) !== -1,
      ).sort();
      this.foundCardNames = newCardNames.slice(0, 5);
    },
  },
});
</script>
