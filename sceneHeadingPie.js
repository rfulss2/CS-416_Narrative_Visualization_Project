import { annotate } from './main.js';

// TODO:
// Fix legend, fix labels : DONE
// SOLUTION ! Can group all smaller nations into one section, call it "OTHER" : THIS ACTUALLY LOOKS OK
// This is alot harder than i thought it would be

// IMPORTANT ::::::: REVIEW LESSON FOR HOW TO MAKE A PIE CHART WITH SVG AND D3 !!!!
// Added year controls via <select> dropdown and Prev/Next buttons; original comments preserved
export function sceneContribSharePie(state) {
  // Initialize year controls once
  if (!sceneContribSharePie.initialized) {
    const select = document.getElementById('year-select');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');

    select.addEventListener('change', () => {
      state.selectedYear = +select.value;
      sceneContribSharePie(state);
    });

    prevBtn.addEventListener('click', () => {
      if (state.selectedYear > +select.min) {
        state.selectedYear -= 1;
        select.value = state.selectedYear;
        sceneContribSharePie(state);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (state.selectedYear < +select.max) {
        state.selectedYear += 1;
        select.value = state.selectedYear;
        sceneContribSharePie(state);
      }
    });

    sceneContribSharePie.initialized = true;
  }

  const svg = d3.select('#scene-location-test');
  svg.selectAll('*').remove();
  const { width, height } = svg.node().getBoundingClientRect();

  // describe to the audience what this pie chart is, update text
  svg.append('text')
    .attr('x', width/2)
    .attr('y', height - 20)
    .attr('text-anchor','middle')
    .attr('font-size','1rem')
    .attr('font-family','Arial, sans-serif')
    .text(`Breakdown of EU budget contributions in ${state.selectedYear}`);

  // Display current year at top center
  svg.append('text')
    .attr('class', 'year-text')
    .attr('x', width / 2)
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .attr('font-size', '1.2rem')
    .attr('font-family', 'Arial, sans-serif')
    .text(`Year: ${state.selectedYear}`);

  // Filter entries by year
  const entries = state.data.revenue
    .filter(d => d.year === state.selectedYear)
    .map(d => ({ country: d.country, paid: d.eurBn }));
  const total = d3.sum(entries, d => d.paid);

  // figure out how to divide countries
  const division_threshold = 0.02;
  const big = [], small = [];
  for (const d of entries) {
    if (d.paid / total < division_threshold) small.push(d);
    else big.push(d);
  }

  // group everything from small into "OTHER" section
  const otherValue = d3.sum(small, i => i.paid);
  const data = big.map(i => ({ label: i.country, value: i.paid }));
  if (otherValue > 0) data.push({ label: 'Other', value: otherValue });

  // setup the circle
  const radius = Math.min(width, height) / 2 - 60;
  const cx = width / 2, cy = height / 2 + 10;
  const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);
  const color = d3.scaleOrdinal(data.map(i => i.label), d3.schemeSet3);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const pie = d3.pie().sort(null).value(i => i.value);
  const slices = pie(data);

  // draw pie slices
  g.selectAll('path')
    .data(slices)
    .enter().append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label))
      .append('title')
        .text(d => `${d.data.label}: ${d3.format('.1f')(d.data.value)} € bn`);

  // set all the labels properly
  const labelArc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius * 0.6);
  g.selectAll('text.slice')
    .data(slices)
    .enter().append('text')
      .attr('class','slice')
      .attr('transform', i => `translate(${labelArc.centroid(i)})`)
      .attr('text-anchor','middle')
      .attr('font-size','1rem')
      .attr('font-family','Arial, sans-serif')
      .text(i => i.data.label === 'Other' || (i.endAngle - i.startAngle) > 0.06 ? i.data.label : '');

  // figure out legend
  const legend = svg.append('g').attr('transform', `translate(${width - 140},${40})`);
  legend.selectAll('rect')
    .data(data)
    .enter().append('rect')
      .attr('x', 0).attr('y',(d, i) => i * 20)
      .attr('width', 12).attr('height',12)
      .attr('fill', d => color(d.label));
  legend.selectAll('text')
    .data(data)
    .enter().append('text')
      .attr('x', 16).attr('y',(d, i)=> i * 20 + 10)
      .attr('font-size','0.8rem')
      .attr('font-family','Arial, sans-serif')
      .text(i => i.label);

  // get all country names and abbreviations - for explanatory column
  const countryNames = {
    AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria', HR: 'Croatia',
    CY: 'Cyprus', CZ: 'Czechia', DK: 'Denmark', EE: 'Estonia',
    FI: 'Finland', FR: 'France', DE: 'Germany', EL: 'Greece',
    HU: 'Hungary', IE: 'Ireland', IT: 'Italy', LV: 'Latvia',
    LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', NL: 'Netherlands',
    PL: 'Poland', PT: 'Portugal', RO: 'Romania', SK: 'Slovakia',
    SI: 'Slovenia', ES: 'Spain', SE: 'Sweden', Other: 'Other states'
  };

  const codes = data.map(i => i.label);
  const mapLegend = svg.append('g')
    .attr('transform', `translate(${width - 120},${40 + data.length * 20 + 20})`);
  mapLegend.selectAll('text')
    .data(codes)
    .enter().append('text')
      .attr('x', -30)
      .attr('y', (u,i) => i * 18 + 10)
      .attr('font-size','1rem')
      .attr('font-family','Arial, sans-serif')
      .text(code => `${code}: ${countryNames[code]}`);

  svg.selectAll('.annotation-group').remove();
}
