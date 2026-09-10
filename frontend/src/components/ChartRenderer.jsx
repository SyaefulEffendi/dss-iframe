import React from 'react';
import ReactECharts from 'echarts-for-react';

const ChartRenderer = ({ chartType, xAxis, yAxis, data }) => {
  if (!data || data.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>Tidak ada data</div>;
  }

  // Siapkan data untuk ECharts
  const xData = data.map(item => item[xAxis]);
  const yData = data.map(item => Number(item[yAxis]));

  let option = {};

  switch (chartType) {
    case 'bar':
    case 'line':
    case 'area':
    case 'scatter':
      option = {
        tooltip: { trigger: 'axis' },
        xAxis: { 
          type: 'category', 
          data: xData,
          axisLabel: { rotate: 30 }
        },
        yAxis: { type: 'value' },
        series: [{
          data: yData,
          type: chartType === 'area' ? 'line' : chartType,
          areaStyle: chartType === 'area' ? {} : null,
          itemStyle: { color: '#6366f1' },
          smooth: chartType === 'line' || chartType === 'area'
        }],
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true }
      };
      break;
    
    case 'pie':
      option = {
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
          type: 'pie',
          radius: '50%',
          data: data.map(item => ({ name: item[xAxis], value: Number(item[yAxis]) })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
      break;

    case 'radar':
      // Untuk radar, kita asumsikan xAxis adalah nama indikator dan yAxis adalah nilainya
      const maxVal = Math.max(...yData);
      option = {
        tooltip: {},
        radar: {
          indicator: xData.map(x => ({ name: x, max: maxVal * 1.2 })) // Beri buffer 20%
        },
        series: [{
          type: 'radar',
          data: [
            {
              value: yData,
              name: 'Data'
            }
          ],
          itemStyle: { color: '#6366f1' },
          areaStyle: { color: 'rgba(99, 102, 241, 0.4)' }
        }]
      };
      break;

    case 'gauge':
      // Gauge biasanya hanya menampilkan 1 nilai. Kita ambil nilai pertama atau rata-rata.
      const gaugeVal = yData.length > 0 ? yData[0] : 0;
      option = {
        tooltip: { formatter: '{a} <br/>{b} : {c}%' },
        series: [{
          name: xAxis,
          type: 'gauge',
          detail: { formatter: '{value}' },
          data: [{ value: gaugeVal, name: xData[0] || 'Score' }]
        }]
      };
      break;

    case 'heatmap':
      // Heatmap biasanya butuh struktur matrix [x, y, value]. Untuk data linear (xAxis, yAxis), kita jadikan barisan sel.
      // ECharts Heatmap requires coordinate system. We will create a simple 1D heatmap or a generic cartesian heatmap.
      option = {
        tooltip: { position: 'top' },
        xAxis: { type: 'category', data: xData, splitArea: { show: true } },
        yAxis: { type: 'category', data: ['Value'], splitArea: { show: true } },
        visualMap: {
          min: Math.min(...yData),
          max: Math.max(...yData),
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%'
        },
        series: [{
          name: 'Heatmap',
          type: 'heatmap',
          data: yData.map((val, idx) => [idx, 0, val]),
          label: { show: true }
        }]
      };
      break;

    default:
      option = {
        xAxis: { type: 'category', data: xData },
        yAxis: { type: 'value' },
        series: [{ data: yData, type: 'bar' }]
      };
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

export default ChartRenderer;
