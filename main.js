export const EU27 = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','EL','HU','IE',
  'IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE'
]);

const state = {
  scene: 0,
  data: {},
  revSum: null,
  expSum: null,
  net: null,
  selectedYear: 2023
};

// import all the data properly
// damn this is harder than i thought
Promise.all([
  d3.csv('data/revenue_2000_2023.csv',
         i => ({ country: i.country, year: +i.year, eurBn: +i.eur_million / 1000 })),
  d3.csv('data/expenditure_2000_2023.csv',
         i => ({ country: i.country, year: +i.year, eurBn: +i.eur_million / 1000, heading: i.heading })),
]).then(([rev, exp, topo]) => {

  state.data.revenue  = rev.filter(i => i.year >= 2014 && EU27.has(i.country));
  state.data.spending = exp.filter(i => i.year >= 2014 && EU27.has(i.country));
  state.data.geo      = topo;

  state.revSum = d3.rollup(
    state.data.revenue,
    vs => d3.sum(vs, i => i.eurBn),
    i => i.country
  );

  state.expSum = d3.rollup(
    state.data.spending,
    vs => d3.sum(vs, i => i.eurBn),
    i => i.country
  );

  state.net = new Map([...EU27].map(i => [i, (state.expSum.get(i)) - (state.revSum.get(i))]));

  init();
});

import { sceneOverview } from './sceneOverview.js';
import { sceneDivergingBar } from './sceneDivergingBar.js';
import { sceneContribSharePie } from './sceneHeadingPie.js';

const scenes = [sceneOverview, sceneDivergingBar, sceneContribSharePie];

export function init() {
  d3.select('#next').on('click', () => switchScene( 1 ));
  d3.select('#prev').on('click', () => switchScene( -1 ));

  /* year-dropdown must exist before we bind the handler */
  d3.select('#year-select').on('change', function () {
    state.selectedYear = +this.value;
    if (state.scene === 1) {
      /* clear current scene and redraw diverging bars */
      d3.select('#scene_location_test').selectAll('*').remove();
      sceneDivergingBar(state);
    }
  });

  switchScene(0);
}

export function switchScene(step) {
  let next = state.scene + step;

  if (next < 0) {
    next = (next % scenes.length) + scenes.length;
  } else if (next >= scenes.length) {
    next = next % scenes.length;
  }

  state.scene = next;

  /* correct id for the main svg */
  const viz = d3.select('#scene_location_test');
  viz.selectAll('*').remove();

  const drawScene = scenes[state.scene];
  if (typeof drawScene === 'function') {
    drawScene(state);
  }

  d3.select('#year-select-container')
    .classed('hidden', state.scene !== 1);
}

// this is prob the hardest function to write ngl
// how do i deal with the annotation
export function annotate(svg, text, x, y) {

  let Annotation = null;

  if (window.d3 && window.d3.annotation) {
    Annotation = window.d3.annotation;
  } else if (window.d3Annotation && window.d3Annotation.annotation) {
    Annotation = window.d3Annotation.annotation;
  }

  if (!Annotation) {
    return;
  }

  const spec = { note: { label: text }, x, y, dx: 0, dy: -20 };

  svg.select('g.annotation-group').remove();

  svg.append('g')
     .attr('class', 'annotation-group annotation')
     .call(Annotation().annotations([spec]));
}
