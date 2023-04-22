import {
  Fill,
  Stroke,
  Text,
} from 'ol/style.js';
const getText = function (feature, resolution, dom) {
  const type = 'wrap';
  const maxResolution = 600;
  let text =   '' //dom.label;

  if (resolution > maxResolution) {
    text = '';
  } else if (type == 'hide') {
    text = '';
  } else if (type == 'shorten') {
    text = text.trunc(12);
  }
  // else if (type == 'wrap') {
  //   text = stringDivider(text, 16, '\n');
  // }

  return text;
};

export const createTextStyle = function (feature, resolution, dom) {
  const size = '12px';
  const height = 1;
  const weight = 'bold';
  // const maxAngle = dom.maxangle ? parseFloat(dom.maxangle.value) : undefined;
  const overflow = 'true';
  // if (dom.font.value == "'Open Sans'" && !openSansAdded) {
  //   const openSans = document.createElement('link');
  //   openSans.href = 'https://fonts.googleapis.com/css?family=Open+Sans';
  //   openSans.rel = 'stylesheet';
  //   document.head.appendChild(openSans);
  //   openSansAdded = true;
  // }
  const font = weight + ' ' + size + '/' + height + ' ' + 'arial';
  const fillColor = dom.layer_color;
  const outlineColor = '#fffff';

  return new Text({
    textAlign: 'center',
    textBaseline: 'middle',
    font: font,
    text: getText(feature, resolution, dom),
    fill: new Fill({color: fillColor}),
    stroke: new Stroke({color: outlineColor, width: 3}),
    offsetX: 0,
    offsetY: 0,
    placement: 'point',
    // maxAngle: maxAngle,
    overflow: overflow,
    rotation: 0,
  });
};
