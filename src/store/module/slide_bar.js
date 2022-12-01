const state = {
  collapsed: false,
};

const actions = {
  onToggleCollapse({commit}, collapsed) {
    commit('toggleCollapseSuccess', collapsed);
  },
};

const mutations = {
  toggleCollapseSuccess(state, collapsed) {
    state.collapsed = collapsed === "app-bar" ? !state.collapsed : collapsed;
  },
};

export const slide_bar = {
  namespaced: true,
  state,
  actions,
  mutations
};
