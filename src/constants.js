// @flow

export const PX_PER_MS = 1;
export const BAR_HEIGHT = 16;
export const BAR_Y_GUTTER = 1;
export const BAR_X_GUTTER = 1;

const MIN_ZOOM_SMALL = 0.2;
const MIN_ZOOM_LARGE = 0.01;
const LARGE = window.location.search.slice(1).includes('large');

export const MIN_ZOOM = LARGE ? MIN_ZOOM_LARGE : MIN_ZOOM_SMALL; // TODO: determine from trace extents
export const MAX_ZOOM = 100;

export const TOOLTIP_OFFSET = 8;
export const TOOLTIP_HEIGHT = 20;
