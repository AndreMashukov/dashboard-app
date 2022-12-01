import {TRACKING_ANSWER, PROFILE_USER, PAYMENT} from "@/common/apiUrls";
import axios from "axios";

const state = {
  trackingAnswer: [],
  totalUser: 0,
  revenue: 0,
}
const actions = {
  async getReportTracking({commit, dispatch}) {
    try {
      const res = await axios.get(`${TRACKING_ANSWER}/report`);
      const lengthSeries = Math.max.apply(Math, res.data.map(function(o) { return o.answers.length; }))
      let series = new Array(lengthSeries);
      for (let i = 0, length = res.data.length; i < length; i++) {
        const {answers, options, type, question} = res.data[i];
        for(let j = 0, leg = answers.length; j < lengthSeries; j++) {
          if(i === 0) series[j] = {data: []}
          if(j >= leg) {
            const x = JSON.stringify({question, name: ""})
            series[j].data.push({x, y: 0})
            continue;
          }
          const {answer, count} = answers[j];
          if(type === "input") {
            const x = JSON.stringify({question, name: answer})
            series[j].data.push({x, y: count})
            continue;
          }
          const idx = options.findIndex(val => val.index === answer)
          const x = JSON.stringify({question, name: options[idx]?.value})
          series[j].data.push({x, y: count})
        }
      }
      commit("setTrackingAnswer", series)
    } catch (e) {
      dispatch('alert/error', "Create tracking topic fail!", {root: true})
    }
  },
  async countUser({dispatch, commit}) {
    try {
      const res = await axios.get(`${PROFILE_USER}/count`);
      commit("setTotalUser", res.totalItems)
    } catch (e) {
      dispatch('alert/error', "Count user fail!", {root: true})
    }
  },
  async revenueMonth({dispatch, commit}) {
    try {
      let date = new Date();
      let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const url = `${PAYMENT}/revenue?start=${firstDay.toISOString()}&end=${lastDay.toISOString()}`
      const res = await axios.get(url);
      commit("setRevenue", res.revenue)
    } catch (e) {
      dispatch('alert/error', "Count user fail!", {root: true})
    }
  },
}

const mutations = {
  setTrackingAnswer(state, data) {
    state.trackingAnswer = data;
  },
  setTotalUser(state, data) {
    state.totalUser = data;
  },
  setRevenue(state, data) {
    state.revenue = data;
  }
}

export const reports = {
  namespaced: true,
  state,
  actions,
  mutations
};
