import paper from "paper";
import { omit } from "lodash-es";

export class RoundedRectangle {
  constructor(object) {
    if (object.hasOwnProperty("corners")) {
      this.corners = object.corners;
      this.path = new paper.Path(omit(object, ["corners"]));
      this.path.closed = true;

      const point1 = new paper.Point(object.point);
      const point2 = point1.add(new paper.Point(object.size[0], 0));
      const point3 = point2.add(new paper.Point(0, object.size[1]));
      const point4 = point3.subtract(new paper.Point(object.size[0], 0));
      let firstPoint, lastPoint, firstSegment, secondSegment;

      // Top Left
      if (object.corners[0]) {
        firstPoint = point1.add(new paper.Point(0, object.corners[0][1]));
        lastPoint = point1.add(new paper.Point(object.corners[0][0], 0));
        firstSegment = new paper.Segment(firstPoint, null, {
          x: 0,
          y: -object.corners[0][1] / 2
        });
        secondSegment = new paper.Segment(
          lastPoint,
          {
            x: -object.corners[0][0] / 2,
            y: 0
          },
          null
        );
        this.topLeft = this.path.add(firstSegment, secondSegment);
      } else {
        this.topLeft = this.path.add(point1);
      }

      // Top Right
      if (object.corners[1]) {
        firstPoint = point2.subtract(new paper.Point(object.corners[1][0], 0));
        lastPoint = point2.add(new paper.Point(0, object.corners[1][1]));
        firstSegment = new paper.Segment(firstPoint, null, {
          x: object.corners[1][0] / 2,
          y: 0
        });
        secondSegment = new paper.Segment(
          lastPoint,
          {
            x: 0,
            y: -object.corners[1][1] / 2
          },
          null
        );
        this.topRight = this.path.add(firstSegment, secondSegment);
      } else {
        this.topRight = this.path.add(point2);
      }

      // Bottom Right
      if (object.corners[2]) {
        firstPoint = point3.subtract(new paper.Point(0, object.corners[2][1]));
        lastPoint = point3.subtract(new paper.Point(object.corners[2][0], 0));
        firstSegment = new paper.Segment(firstPoint, null, {
          x: 0,
          y: object.corners[2][1] / 2
        });
        secondSegment = new paper.Segment(
          lastPoint,
          {
            x: object.corners[2][0] / 2,
            y: 0
          },
          null
        );
        this.bottomRight = this.path.add(firstSegment, secondSegment);
      } else {
        this.bottomRight = this.path.add(point3);
      }

      // Bottom Left
      if (object.corners[3]) {
        firstPoint = point4.add(new paper.Point(object.corners[3][0], 0));
        lastPoint = point4.subtract(new paper.Point(0, object.corners[3][1]));
        firstSegment = new paper.Segment(firstPoint, null, {
          x: -object.corners[3][0] / 2,
          y: 0
        });
        secondSegment = new paper.Segment(
          lastPoint,
          {
            x: 0,
            y: object.corners[3][1] / 2
          },
          null
        );
        this.bottomLeft = this.path.add(firstSegment, secondSegment);
      } else {
        this.bottomLeft = this.path.add(point4);
      }
    } else {
      throw new Error("use normal rectangles");
    }
  }

  changeSize([width, height]) {
    const point1 = this.path.bounds.topLeft;
    const point2 = point1.add(new paper.Point(width, 0));
    const point3 = point2.add(new paper.Point(0, height));
    const point4 = point3.subtract(new paper.Point(width, 0));
    if (this.corners[1]) {
      this.topRight[0].point = point2.subtract(
        new paper.Point(this.corners[1][0], 0)
      );
      this.topRight[1].point = point2.add(
        new paper.Point(0, this.corners[1][1])
      );
    } else {
      this.topRight.point = point2;
    }
    if (this.corners[2]) {
      this.bottomRight[0].point = point3.subtract(
        new paper.Point(0, this.corners[2][1])
      );
      this.bottomRight[1].point = point3.subtract(
        new paper.Point(this.corners[2][0], 0)
      );
    } else {
      this.bottomRight.point = point3;
    }
    if (this.corners[3]) {
      this.bottomLeft[0].point = point4.add(
        new paper.Point(this.corners[3][0], 0)
      );
      this.bottomLeft[1].point = point4.subtract(
        new paper.Point(0, this.corners[3][1])
      );
    } else {
      this.bottomLeft.point = point4;
    }
  }
}
