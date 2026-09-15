import Msg from './Msg';
import BarsStage from './stages/BarsStage';
import CellsStage from './stages/CellsStage';
import TreeStage from './stages/TreeStage';
import TableStage from './stages/TableStage';
import GridStage from './stages/GridStage';
import GeoStage from './stages/GeoStage';

export default function Stage({ algo, player, frames, target }) {
  const { frame } = player;
  const last = frames[frames.length - 1];

  let view;
  switch (algo.kind) {
    case 'bars': view = <BarsStage frame={frame} max={Math.max(1, ...frames[0].arr)} />; break;
    case 'cells': view = <CellsStage frame={frame} target={target} />; break;
    case 'tree': view = <TreeStage frame={frame} structure={algo.structure} />; break;
    case 'table': view = <TableStage frame={frame} finalResult={last.result} />; break;
    case 'grid': view = <GridStage frame={frame} />; break;
    case 'geo': view = <GeoStage frame={frame} />; break;
    default: view = null;
  }

  return (
    <section className="stage">
      <div>{view}</div>
      <div className="caption">
        <div className="msg"><Msg text={frame.msg} /></div>
        {frame.loop && <span className="loop">{frame.loop}</span>}
      </div>
      <div className="legend">
        {algo.legend.map(([color, label]) => (
          <span key={label} style={{ '--sw': `var(--${color})` }}>{label}</span>
        ))}
      </div>
    </section>
  );
}
