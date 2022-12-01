<script>
import {mapActions, mapState} from "vuex";

const separator = {
  template: `<hr style="border-color: rgba(0, 0, 0, 0.1); margin: 20px;">`
}
export default {
  name: 'SideBar',
  data: () => ({
    menu: [
      {
        href: '/',
        title: 'Dashboards',
        icon: {
          element: 'i',
          class: 'fas fa-home',
        }
      },
      {
        component: separator
      },
      {
        header: true,
        title: 'Menu',
        hiddenOnCollapse: true
      },
      {
        href: '/user',
        title: 'Users',
        icon: {
          element: 'i',
          class: 'fas fa-user-friends',
        }
      },
      {
        href: '/membership',
        title: 'Membership',
        icon: {
          element: 'i',
          class: 'fas fa-address-card',
        }
      },
      {
        href: '/code',
        title: 'Codes',
        icon: {
          element: 'i',
          class: 'fas fa-comments-dollar'
        }
      },
      {
        href: '/payment',
        title: 'Payments',
        icon: {
          element: 'i',
          class: "fab fa-cc-paypal"
        }
      },
      {
        href: '/tracking-topic',
        title: 'Tracking',
        icon: {
          element: 'i',
          class: "fab fa-stack-exchange"
        }
      },
      {
        href: '/media',
        title: 'Medias',
        icon: {
          element: 'i',
          class: 'fas fa-photo-video',
        },
        child: [
          {
            href: '/media/series',
            title: 'Series',
            // icon: 'fa fa-file-alt'
          },
          {
            href: '/media/category',
            title: 'Category',
            // icon: 'fa fa-file-alt'
          },
          {
            href: '/media/topic',
            title: 'Topic',
            // icon: 'fa fa-file-alt'
          },
          {
            href: '/media/tags',
            title: 'Tags',
            // icon: 'fa fa-file-alt'
          },
        ],
      },
      {
        href: '/survey',
        title: 'Survey',
        icon: {
          element: 'i',
          class: 'fas fa-question',
        }
      },
      {
        href: '/dietary',
        title: 'Dietary',
        icon: {
          element: 'i',
          class: 'fas fa-leaf',
        }
      },
      {
        component: separator
      },
      {
        header: true,
        title: 'Food',
        hiddenOnCollapse: true
      },
      {
        href: '/meal-plan',
        title: 'Meal plan',
        icon: {
          element: 'i',
          class: "fas fa-tasks"
        },
      },
      {
        href: '/recipe',
        title: 'Recipes',
        icon: {
          element: 'i',
          class: "fas fa-utensils"
        },
        child: [
          {
            href: '/recipe/meal',
            title: 'Meal',
            // icon: 'fa fa-file-alt'
          },
          {
            href: '/recipe/tags',
            title: 'Tags',
            // icon: 'fa fa-file-alt'
          },
          {
            href: '/recipe/dietary',
            title: 'Dietary',
            // icon: 'fa fa-file-alt'
          },
          {
            href: '/recipe/category',
            title: 'Category',
            // icon: 'fa fa-file-alt'
          },
          {
            href: '/recipe/type',
            title: 'Type',
            // icon: 'fa fa-file-alt'
          },
        ]
      },
      {
        href: '/ingredients',
        title: 'Ingredients',
        icon: {
          element: 'i',
          class: 'fas fa-pizza-slice',
        },
        child: [
          {
            href: '/ingredients/category',
            title: 'Category',
            // icon: 'fa fa-file-alt'
          },
        ]
      },
      {
        component: separator
      },
      {
        header: true,
        title: 'System',
        hiddenOnCollapse: true
      },
      {
        href: '/campaign',
        title: 'Campaigns',
        icon: {
          element: 'i',
          class: "fas fa-ad"
        }
      },
      {
        href: '/setting',
        title: 'Setting',
        icon: {
          element: 'i',
          class: "fas fa-cog"
        }
      },
    ],
    isOnMobile: false
  }),
  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
  },
  computed: {
    ...mapState('slide_bar', ['collapsed']),
    ...mapState('account', ['status']),
  },
  methods: {
    ...mapActions('slide_bar', ['onToggleCollapse']),
    onResize() {
      if (window.innerWidth <= 767) {
        this.isOnMobile = true
        this.onToggleCollapse(true)
      } else {
        this.isOnMobile = false
        this.onToggleCollapse(false)
      }
    }
  }
}
</script>

<template>
  <div>
    <sidebar-menu
      v-if="status.loggedIn"
      :menu="menu"
      :collapsed="collapsed"
      :show-one-child="true"
      :hide-toggle="true"
      width="250px"
    />
    <div
      v-if="isOnMobile && !collapsed"
      class="sidebar-overlay"
      @click="onToggleCollapse"
    />
    <div
      :id="status.loggedIn ? 'props-layout' : ''"
      :class="[{'collapsed' : status.loggedIn && collapsed}, {'onmobile' : isOnMobile}]"
    >
      <div :class="status.loggedIn ? 'props-layout' : ''">
        <slot/>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#props-layout {
  padding-left: 250px;
  transition: 0.3s ease;
}

#props-layout.collapsed {
  padding-left: 50px;
}

#props-layout.onmobile {
  padding-left: 50px;
}

.v-sidebar-menu .vsm--link.vsm--link_exact-active {
  -webkit-box-shadow: 3px 0px 0px 0px #4285f4 inset;
  box-shadow: 3px 0px 0px 0px #4285f4 inset;
}

.sidebar-overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #000;
  opacity: 0.5;
  z-index: 900;
}

.props-layout {
  padding: 10px;
}

.container {
  max-width: 100%;
}

</style>
