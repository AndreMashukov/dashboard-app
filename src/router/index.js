import Vue from 'vue'
import VueRouter from 'vue-router'
import NotFound from "@/views/404";
import Users from '@/views/Users'
import Membership from '@/views/Membership'
import Login from '@/views/Login'
import Medias from '@/views/media/Media'
import MediasTags from '@/views/media/Tags'
import MediaSeries from '@/views/media/Series'
import MediaCategory from '@/views/media/Category'
import MediaTopic from '@/views/media/Topic'
import Codes from '@/views/Codes.vue'
import UserProfile from "@/views/UserProfile";
import Payments from "@/views/Payments";
import MealPlan from "@/views/MealPlan";
import Recipe from "@/views/recipes/Recipe";
import RecipeMeal from "@/views/recipes/Meal";
import RecipeTags from "@/views/recipes/Tags";
import RecipeCategory from "@/views/recipes/Category";
import RecipeDietary from "@/views/recipes/Dietary";
import RecipesType from "@/views/recipes/Type";
import Tracking from "@/views/Tracking";
import Survey from "@/views/survey/Survey";
import Ingredients from "@/views/ingredients/Ingredients";
import IngredientsCategory from "@/views/ingredients/Category";
import Dietary from "@/views/Dietary";
import Home from "@/views/Home";
// import Setting from "@/views/Setting";
import Campaign from "@/views/Campaign";
import Setting from "@/views/setting/Setting";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/user',
    name: 'user',
    component: Users
  },
  {
    path: '/membership',
    name: 'membership',
    component: Membership
  },
  {
    path: '/media',
    name: 'Media',
    component: Medias
  },
  {
    path: '/media/tags',
    name: 'MediaTags',
    component: MediasTags
  },
  {
    path: '/media/series',
    name: 'MediaSeries',
    component: MediaSeries
  },
  {
    path: '/media/category',
    name: 'MediaCategory',
    component: MediaCategory
  },
  {
    path: '/media/topic',
    name: 'MediaTopic',
    component: MediaTopic
  },
  {
    path: '/code',
    name: 'Code',
    component: Codes
  },
  {
    path: '/payment',
    name: 'Payments',
    component: Payments
  },
  {
    path: '/meal-plan',
    name: 'MealPlan',
    component: MealPlan
  },
  {
    path: '/recipe',
    name: 'Recipe',
    component: Recipe
  },
  {
    path: '/recipe/meal',
    name: 'RecipeMeal',
    component: RecipeMeal
  },
  {
    path: '/recipe/tags',
    name: 'RecipeTags',
    component: RecipeTags
  },
  {
    path: '/recipe/category',
    name: 'RecipeCategory',
    component: RecipeCategory
  },
  {
    path: '/recipe/dietary',
    name: 'RecipeDietary',
    component: RecipeDietary
  },
  {
    path: '/recipe/type',
    name: 'RecipesType',
    component: RecipesType
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Setting
  },
  {
    path: '/campaign',
    name: 'Campaign',
    component: Campaign
  },
  {
    path: '/tracking-topic',
    name: 'Tracking Topic',
    component: Tracking
  },
  {
    path: '/survey',
    name: 'Survey',
    component: Survey
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfile
  },
  {
    path: '/ingredients',
    name: 'Ingredients',
    component: Ingredients
  },
  {
    path: '/ingredients/category',
    name: 'IngredientsCategory',
    component: IngredientsCategory
  },
  {
    path: '/dietary',
    name: 'Dietary',
    component: Dietary
  },
  {
    path: '/page-not-found',
    name: 'PageNotFound',
    component: NotFound
  },
  {
    path: "*",
    redirect: "page-not-found",
  },
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL + "wp-admin/admin.php?page=manage_podcast",
  routes
})

export default router
