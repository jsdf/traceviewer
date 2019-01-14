export type HandleStateChangeFn = (changes: {
  zoom?: number,
  center?: number,
  dragging?: boolean,
  dragMoved?: boolean,
  hovered?: ?RenderableMeasure<Measure>,
  selection?: ?RenderableMeasure<Measure>,
  zooming?: boolean,
}) => void;
