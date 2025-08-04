import { annotate } from './main.js';

// TODO :
// 1. add text so user has an easier time understanding whats going on : DONE
// 2. add margins so is space for text : DONE
// 3. change so that imports are taken care of in main.js !!!! : DONE
// 4. REMEMBER, NEEEEED TO FIX ANNOTATIONS, idk whats wrong... : PARTIALLY DONE : NO CLUE HOW TO FIX THIS !!!!!!!
// 5. REMEMBER, NEED TO ADD LEGEND !!! : DONE

export function sceneOverview(state){
  const svg = d3.select('#scene-location-test');
  svg.selectAll('*').remove();
  const { width, height } = svg.node().getBoundingClientRect();

  // margins for plot
  // REMEMBER : Will need to add text describing whats going on !!!
  const margin = { top: 40, right: 300, bottom: 60, left: 300 };
  const width_inside = width  - margin.left - margin.right;
  const height_inside = height - margin.top  - margin.bottom;

  // get spending and income data
  // edit : make this a function, and handle the .csv importing in main.js
  const years = d3.range(2014, 2024);
  const rev = d3.rollup(state.data.revenue, vs => d3.sum(vs, i => i.eurBn), i => i.year);

  const exp = d3.rollup(state.data.spending, vs => d3.sum(vs, i => i.eurBn), i => i.year);
  const max_y_val = d3.max([ ...rev.values(), ...exp.values() ]);

  const x = d3.scaleBand()
    .domain(years)
    .range([0, width_inside])
    .padding(0.15);

  const y = d3.scaleLinear()
    .domain([0, max_y_val]).nice()
    .range([height_inside, 0]);

  // svg area
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // x-axis
  g.append('g')
    .attr('transform', `translate(0,${height_inside})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')))
    .selectAll('text')
    .attr('font-size','1rem')
    .attr('font-family','Arial, sans-serif');

  // y-axis
  g.append('g')
    .call(d3.axisLeft(y)
    .ticks(6)
    .tickFormat(d => d3.format('.1f')(d) + ' millions'))
    .selectAll('text')
    .attr('font-size','1rem')
    .attr('font-family','Arial, sans-serif');

  // revenue bars 
  g.selectAll('.r')
    .data(years)
    .enter().append('rect')
      .attr('class','r')
      .attr('x', d => x(d))
      .attr('y', d => y(rev.get(d)))
      .attr('width', x.bandwidth()/2)
      .attr('height', d => height_inside - y(rev.get(d)))
      .attr('fill', '#003399')
      .on('mouseover', (ev,d) => {
        annotate(svg,`Year ${d} Revenue: ${d3.format('.1f')(rev.get(d))} millions`, ev.offsetX, ev.offsetY);});

  // expenditure
  g.selectAll('.e')
    .data(years)
    .enter().append('rect')
    .attr('class','e')
    .attr('x', d => x(d) + x.bandwidth() / 2)
    .attr('y', d => y(exp.get(d)))
    .attr('width', x.bandwidth() / 2)
    .attr('height', d => height_inside - y(exp.get(d)))
    .attr('fill', '#ff9900')
    .on('mouseover', (ev,d) => {
      annotate(svg,`Year ${d} Expenditure: ${d3.format('.1f')(exp.get(d))} millions`,ev.offsetX, ev.offsetY);});

  // y and x axis labels
  svg.append('text')
    .attr('transform', `translate(${margin.left / 2}, ${margin.top + height_inside / 2}) rotate(-90)`)
    .attr('text-anchor','middle')
    .attr('font-size','1rem')
    .attr('font-family','Arial, sans-serif')
    .text('Millions of Euros');

  svg.append('text')
    .attr('x', margin.left + width_inside / 2)
    .attr('y', height - margin.bottom / 4)
    .attr('text-anchor','middle')
    .attr('font-size','1rem')
    .attr('font-family','Arial, sans-serif')
    .text('Year');

  // title
  annotate(svg,
    'EU aggregate budget flows by year (2014-23)',
    margin.left + 20,
    30
  );

  // legend
  const legendData = [
    {label: 'Revenue', color: '#003399'},
    {label: 'Expenditure', color: '#ff9900'}
  ];

  const legend = svg.append('g')
    .attr('transform', `translate(${margin.left + width_inside + 40}, ${margin.top})`);

  legend.selectAll('rect')
    .data(legendData)
    .enter().append('rect')
    .attr('x', 0)
    .attr('y', (d,i) => i * 25)
    .attr('width', 14)
    .attr('height', 14)
    .attr('fill', i => i.color);

  // may need to toy around with the y positioning...
  // i think its fine rn
  legend.selectAll('text')
    .data(legendData)
    .enter().append('text')
    .attr('x', 20)
    .attr('y', (d,i) => i * 25 + 11)
    .attr('alignment-baseline','middle')
    .attr('font-size','1rem')
    .attr('font-family','Arial, sans-serif')
    .text(i => i.label);

  svg.append('text')
    .attr('x', margin.left + width_inside / 2)
    .attr('y', 45)
    .attr('text-anchor','middle')
    .attr('font-size','1rem')
    .attr('font-family','Arial, sans-serif')
    .text('Annual European Union (EU) Budget flows from 2014 to 2023 : Blue columns show EU total revenue, yellow collumns show expenditures.');
    
}
