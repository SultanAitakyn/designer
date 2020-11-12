import paper from "paper";
import { RelationType } from "./Relation";
import { CanvasElement } from "@/components/shared/canvas/CanvasElement";
import store from "@/store";

export class RelationCanvasElement extends CanvasElement {
  constructor(relation) {
    super(relation, false);
  }

  initCanvasElements() {
    super.initCanvasElements();
    this.drawArrow();
    this.group.onClick = event => {
      event.stopPropagation();
      if (event.event.button === 0) {
        store.commit("setCurrentEntity", this.entity);
      } else if (event.event.button === 2) {
        store.commit("setMenuPosition", event.point);
        store.commit("setCurrentEntity", this.entity);
      }
    };
  }

  onMouseEnter() {
    super.onMouseEnter();
    this.group.children['arrow'].strokeColor = "#4287f5";
    this.group.children['arrow'].strokeWidth = 1.6;
  }

  onMouseLeave() {
    super.onMouseLeave();
    this.applyColors();
  }

  drawArrow() {
    this.group.removeChildren();
    const { start, end, startDir, endDir } = this.findMinPoints();
    this.start = start;
    this.end = end;
    let spoint=null;
    let epoint=null;

    if (endDir != null) {
      if (endDir==='l') {
        epoint=new paper.Point( end.point.x-10, end.point.y);
      } else {
        epoint=new paper.Point( end.point.x+10, end.point.y);
      }
    }

    if (startDir != null) {
      if (startDir==='l') {
        spoint = new paper.Point( start.point.x-10, start.point.y);
      } else {
        spoint=new paper.Point( start.point.x+10, start.point.y);
      }
    } 

    if (start && end) {
      const arrowVectorS = start.point.subtract(spoint).normalize(10);
      const arrowVectorE = end.point.subtract(epoint).normalize(10);
      const paths= this.getArrow(start.point, end.point, this.entity.type, arrowVectorS, arrowVectorE);

      let arr=new paper.Path([start, end]);
      let arrbound=new paper.Path([start, end]);
      arrbound.strokeWidth=10;
      arrbound.strokeColor = "rgba(191, 191, 191, 0.001)";
      paths.push(arr);
      const arrow = new paper.Group({
        name: "arrow",
        children: paths,
      });
      const bound = new paper.Group({
        name: "bound",
        children: [arrbound],
      });

      this.group.addChildren([arrow]);
      this.group.addChildren([bound]);
      this.group.sendToBack();
      this.applyColors();
    }
  }

  applyColors() {
    this.group.children["arrow"].strokeColor = "#555";
    this.group.children["arrow"].strokeWidth = 1.2;
  }

  getArrow(start, end, type, svector, evector) {
    switch (type) {
      case RelationType.HAS_ONE: {
        return [
          new paper.Path(
            end.add(evector.rotate(150)),
            end,
            end.add(evector.rotate(-150)),
          )
        ];
      }
      case RelationType.HAS_MANY: {
        return [
          new paper.Path(
            new paper.Point(
              end.x - 5 * Math.sin(evector.angleInRadians),
              end.y + 5 * Math.cos(evector.angleInRadians)
            ),
            new paper.Point(
              end.x - 7 * Math.cos(evector.angleInRadians),
              end.y - 7 * Math.sin(evector.angleInRadians)
            ),
            new paper.Point(
              end.x + 5 * Math.sin(evector.angleInRadians),
              end.y - 5 * Math.cos(evector.angleInRadians)
            )
          ),
          new paper.Path(
            new paper.Point(
              end.x -
                7 * Math.cos(evector.angleInRadians) -
                4 * Math.sin(evector.angleInRadians),
              end.y -
                7 * Math.sin(evector.angleInRadians) +
                4 * Math.cos(evector.angleInRadians)
            ),
            new paper.Point(
              end.x -
                7 * Math.cos(evector.angleInRadians) +
                4 * Math.sin(evector.angleInRadians),
              end.y -
                7 * Math.sin(evector.angleInRadians) -
                4 * Math.cos(evector.angleInRadians)
            )
          )
        ];
      }
      case RelationType.MANY_TO_MANY: {
        return [
          new paper.Path(
            new paper.Point(
              end.x - 5 * Math.sin(evector.angleInRadians),
              end.y + 5 * Math.cos(evector.angleInRadians)
            ),
            new paper.Point(
              end.x - 7 * Math.cos(evector.angleInRadians),
              end.y - 7 * Math.sin(evector.angleInRadians)
            ),
            new paper.Point(
              end.x + 5 * Math.sin(evector.angleInRadians),
              end.y - 5 * Math.cos(evector.angleInRadians)
            )
          ),
          new paper.Path(
            new paper.Point(
              start.x - 5 * Math.sin(svector.angleInRadians),
              start.y + 5 * Math.cos(svector.angleInRadians)
            ),
            new paper.Point(
              start.x - 7 * Math.cos(svector.angleInRadians),
              start.y - 7 * Math.sin(svector.angleInRadians)
            ),
            new paper.Point(
              start.x + 5 * Math.sin(svector.angleInRadians),
              start.y - 5 * Math.cos(svector.angleInRadians)
            )
          )
        ];
      }
    }
  }

  findMinPoints() {
    // const line = new paper.Path([
    //   this.entity.source.canvasElement.group.position,
    //   this.entity.target.canvasElement.group.position
    // ]);
    // const sourceIntersections = this.getIntersections(line, this.entity.source);
    // const targetIntersections = this.getIntersections(line, this.entity.target);

    if (!this.entity.source.canvasElement.group.children[this.entity.sourceFieldName]) {
      return {};
    }

    let sourcePoint = null;
    let targetPoint = null;
    let h1=null;
    let h2=null;
    let startDir=null;
    let endDir=null;

    let minDistance = 500000;
    let cd=0;
    //Source Left, Target Left
    cd=this.entity.source.canvasElement.group.children[this.entity.sourceFieldName].bounds.leftCenter
      .getDistance(this.entity.target.canvasElement.group.children[this.entity.targetFieldName].bounds.leftCenter);
      if (cd<minDistance) {
        minDistance=cd;
        sourcePoint = this.entity.source.canvasElement.group.children[this.entity.sourceFieldName].bounds.leftCenter;
        targetPoint = this.entity.target.canvasElement.group.children[this.entity.targetFieldName].bounds.leftCenter;
        h1=[-75,0];
        h2=[-75,0];
        startDir='l';
        endDir='l';
      }
    //Source Right, Target Left
    cd=this.entity.source.canvasElement.group.children[this.entity.sourceFieldName].bounds.rightCenter
      .getDistance(this.entity.target.canvasElement.group.children[this.entity.targetFieldName].bounds.leftCenter);
    if (cd<minDistance) {
      minDistance=cd;
      sourcePoint = this.entity.source.canvasElement.group.children[this.entity.sourceFieldName].bounds.rightCenter;
      targetPoint = this.entity.target.canvasElement.group.children[this.entity.targetFieldName].bounds.leftCenter;
      h1=[75,0];
      h2=[-75,0];
      startDir='r';
      endDir='l';
    }

    //Source Left, Target Right
    cd=this.entity.source.canvasElement.group.children[this.entity.sourceFieldName].bounds.leftCenter
      .getDistance(this.entity.target.canvasElement.group.children[this.entity.targetFieldName].bounds.rightCenter);
    if (cd<minDistance) {
      minDistance=cd;
      sourcePoint = this.entity.source.canvasElement.group.children[this.entity.sourceFieldName].bounds.leftCenter;
      targetPoint = this.entity.target.canvasElement.group.children[this.entity.targetFieldName].bounds.rightCenter;
      h1=[-75,0];
      h2=[75,0];
      startDir='l';
      endDir='r';
    }

    //Source Right, Target Right
    cd=this.entity.source.canvasElement.group.children[this.entity.sourceFieldName].bounds.rightCenter
      .getDistance(this.entity.target.canvasElement.group.children[this.entity.targetFieldName].bounds.rightCenter);
    if (cd<minDistance) {
      minDistance=cd;
      sourcePoint = this.entity.source.canvasElement.group.children[this.entity.sourceFieldName].bounds.rightCenter;
      targetPoint = this.entity.target.canvasElement.group.children[this.entity.targetFieldName].bounds.rightCenter;
      h1=[75,0];
      h2=[75,0];
      startDir='r';
      endDir='r';
    }

    let rc = new paper.Rectangle(sourcePoint, targetPoint);

    let sseg = new paper.Segment(sourcePoint, null, h1);
    let tseg = new paper.Segment(targetPoint, h2, null);

    return {
      start: sseg,
      end: tseg,
      startDir: startDir,
      endDir: endDir
    };
  }

  // getIntersections(line, model) {
  //   const group = model.canvasElement.group;
  //   let intersections = [];
  //   for (let i = 0; i < group.children.length - 1; ++i) {
  //     const containerPath = group.children[i].children["container"];
  //     intersections = intersections.concat(
  //       line.getIntersections(containerPath)
  //     );
  //   }
  //   return intersections;
  // }
}
