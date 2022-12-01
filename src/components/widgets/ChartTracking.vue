<script>
export default {
  name: 'ChartTracking',
  props: {
    series: {
      type: Array,
    }
  },
  data: () => ({
    chartOptions: {
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: true,
        },
      },
      legend: {
        show: false,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "15%",
          endingShape: "rounded",
        },
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        labels: {
          formatter: function () {
            // let data = JSON.parse(val);
            // if(data.question.length > 15 ) data.question = data.question.slice(0, 15) + "...";
            return ""
          }
        }
      },
      tooltip: {
        custom: function ({series, seriesIndex, dataPointIndex, w}) {
          let question = JSON.parse(w.config.series[seriesIndex].data[dataPointIndex].x);
          return '<div class="col-sm-8"><b-card class="text-white-50">\n' +
            '<h5 class="mt-0 mb-4 text-white">\n' +
            question.question +
            '</h5>\n' +
            '<p class="card-text text-white">\n' +
            question.name + ': ' + series[seriesIndex][dataPointIndex] +
            '</p>\n' +
            '</b-card></div>'
        },
      },
      fill: {
        opacity: 1
      },
    }
  }),
}
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="d-sm-flex flex-wrap">
        <h4 class="card-title mb-4">Tracking Topic</h4>
        <!--              <div class="ms-auto">-->
        <!--                <ul class="nav nav-pills">-->
        <!--                  <li class="nav-item">-->
        <!--                    <a-->
        <!--                      class="nav-link"-->
        <!--                      href="javascript: void(0);"-->
        <!--                      @click="changeVal('week')"-->
        <!--                      :class="{'active': isActive === 'week'}"-->
        <!--                    >Week</a>-->
        <!--                  </li>-->
        <!--                  <li class="nav-item">-->
        <!--                    <a-->
        <!--                      class="nav-link"-->
        <!--                      href="javascript: void(0);"-->
        <!--                      @click="changeVal('month')"-->
        <!--                      :class="{'active': isActive === 'month'}"-->
        <!--                    >Month</a>-->
        <!--                  </li>-->
        <!--                  <li class="nav-item">-->
        <!--                    <a-->
        <!--                      class="nav-link"-->
        <!--                      href="javascript: void(0);"-->
        <!--                      @click="changeVal('year')"-->
        <!--                      :class="{'active': isActive === 'year'}"-->
        <!--                    >Year</a>-->
        <!--                  </li>-->
        <!--                </ul>-->
        <!--              </div>-->
      </div>
      <!-- Bar Chart -->
      <apexchart
        id="teabud-apexchart"
        class="apex-charts"
        type="bar"
        dir="ltr"
        height="360"
        :series="series"
        :options="chartOptions"
      ></apexchart>
    </div>
  </div>
</template>

<style>
#teabud-apexchart .apexcharts-tooltip {
  border: 1px solid #ffffff !important;
  background: rgb(80, 165, 241) !important;
  transform: translateX(10px) translateY(10px);
  overflow: visible !important;
  white-space: normal !important;
  width: 350px;
}
#teabud-apexchart .apexcharts-tooltip p {
  width: 325px;
  display: inline-block;
}

#teabud-apexchart .apexcharts-tooltip h5 {
  width: 325px;
  display: inline-block;
}

</style>
