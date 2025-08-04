import { annotate, EU27 } from './main.js';

// TODO:
// 1. Add "Trigger??", should prob add a drop down that lets the user select a year : DONE
// 2. idk how to fix the annotations... AGAIN !!!
// 3. Find official EU colors and change formatting to them : DONE

export function sceneDivergingBar(state) {
  const svg = d3.select('#scene-location-test');
  svg.selectAll('*').remove();
  const { width, height } = svg.node().getBoundingClientRect();

  const margin = { top: 60, right: 300, bottom: 60, left: 300 };
  const width_inside = width  - margin.left - margin.right;
  const height_inside = height - margin.top  - margin.bottom;

  // sentance describing plot
  svg.append('text')
    .attr('x', margin.left + width_inside / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '1rem')
    .attr('font-family', 'Arial, sans-serif')
    .text('For each EU member state, the bars left show payments and right show receipts for the selected year.');

  // select YEAR !!!
  const year = state.selectedYear;
  const data = [...EU27].map(country => ({
    country,
    paid: state.data.revenue.filter(i => i.country == country && i.year == year).reduce((sum, i) => sum + i.eurBn, 0),
    received: state.data.spending.filter(i => i.country == country && i.year == year).reduce((sum, i) => sum + i.eurBn, 0)
  })).sort((a,b) => (b.received - b.paid) - (a.received - a.paid));

  // scales (REMEMBER TO TUNE) - i think were good now
  const maxPaid = d3.max(data, i => i.paid);
  const maxRec  = d3.max(data, i => i.received);

  const x = d3.scaleLinear()
      .domain([-maxPaid, maxRec]).nice()
      .range([0, width_inside]);

  const y = d3.scaleBand()
      .domain(data.map(d => d.country))
      .range([0, height_inside])
      .padding(0.1);

  // chart group
  const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // y-axis
  g.append('g')
    .call(d3.axisLeft(y))
    .selectAll('text')
      .attr('font-size', '1rem')
      .attr('font-family', 'Arial, sans-serif');

  // x-axis
  g.append('g')
    .attr('transform', `translate(0,${height_inside})`)
    .call(d3.axisBottom(x)
      .ticks(7)
      .tickFormat(i => d3.format('+.1f')(i)))
    .selectAll('text')
      .attr('font-size', '1rem')
      .attr('font-family', 'Arial, sans-serif');

  g.append('line')
    .attr('x1', x(0)).attr('x2', x(0))
    .attr('y1', 0).attr('y2', height_inside)
    .attr('stroke', '#000');

  // l;eft bars
  g.selectAll('.bar-paid')
    .data(data)
    .enter().append('rect')
      .attr('class', 'bar-paid')
      .attr('x', i => x(-1 * i.paid))
      .attr('y', i => y(i.country))
      .attr('width', i => x(0) - x(-1 * i.paid))
      .attr('height', y.bandwidth())
      .attr('fill', '#003399')
      .on('mouseover', (ev,i) => {
        annotate(svg,
          `${i.country} Paid: ${d3.format('.1f')(i.paid)} millions`,
          ev.offsetX, ev.offsetY
        );
      });

  // right bars
  g.selectAll('.bar-rec')
    .data(data)
    .enter().append('rect')
      .attr('class', 'bar-rec')
      .attr('x', i => x(0))
      .attr('y', i => y(i.country))
      .attr('width', i => x(i.received) - x(0))
      .attr('height', y.bandwidth())
      .attr('fill', '#FF9900')
      .on('mouseover', (ev,i) => {
        annotate(svg,
          `${i.country} Received: ${d3.format('.1f')(i.received)}`,
          ev.offsetX, ev.offsetY
        );
      });

  // labels
  svg.append('text')
    .attr('x', margin.left + width_inside / 2)
    .attr('y', height - margin.bottom / 4)
    .attr('text-anchor', 'middle')
    .attr('font-size', '1rem')
    .attr('font-family', 'Arial, sans-serif')
    .text('Millions of Euros');

  svg.append('text')
    .attr('transform', `translate(${margin.left / 2},${margin.top + height_inside / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .attr('font-size', '1rem')
    .attr('font-family', 'Arial, sans-serif')
    .text('Country');

}
