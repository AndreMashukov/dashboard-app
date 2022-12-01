import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash'

import {alert} from './module/alert';
import {account} from './module/account';
import {slide_bar} from './module/slide_bar';
import {reports} from "./module/report";
import {users} from './users';
import {medias} from './medias';
import {codes} from './codes';
import {payments} from './payments';
import {recipes} from './recipes';
import {trackings} from './tracking';
import {surveys} from './survey';
import {ingredients} from "./ingredients";
import {dietary} from "./module/dietary";
import {ingredientsCategory} from "./ingredients/category";
import {recipesMeal} from "./recipes/meal";
import {recipesTags} from "./recipes/tags";
import {recipesCategory} from "./recipes/category";
import {recipesDietary} from "./recipes/dietary";
import {recipesType} from "./recipes/type";
import {mediaTags} from "./medias/tags";
import {mediaSeries} from "./medias/series";
import {mediaCategory} from "./medias/category";
import {mediaTopic} from "./medias/topic";
import {membership} from "./module/membership";
import {mealPlan} from "./module/meal_plan";
import {databases} from "./module/import_export";
import {system} from "./module/system";
import {campaign} from "./campaign/index";
import {membershipType} from "./membership/membership_type";

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production'

const initialStoreModules = {
  alert,
  slide_bar,
  account,
  users,
  codes,
  payments,
  recipes,
  trackings,
  surveys,
  reports,
  dietary,
  ingredients,
  ingredientsCategory,
  recipesMeal,
  recipesTags,
  recipesCategory,
  recipesDietary,
  recipesType,
  medias,
  mediaTags,
  mediaSeries,
  mediaCategory,
  mediaTopic,
  membership,
  membershipType,
  mealPlan,
  databases,
  system,
  campaign
}

export const store = new Vuex.Store({
  modules: _.cloneDeep(initialStoreModules),
  mutations: {
    // reset default state modules by looping around the initialStoreModules
    resetState(state) {
      _.forOwn(initialStoreModules, (value, key) => {
        state[key] = _.cloneDeep(value.state);
      });
    },
  },
  strict: debug,
});
