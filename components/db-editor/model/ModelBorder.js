import paper from "paper";
import store from "@/store";
import {makeUuid} from "@/utils/common";
import { RoundedRectangle } from "@/components/shared/canvas/RoundedRectangle";
import { Relation } from "@/components/db-editor/relation/Relation";
import {Field} from "../field/Field";
import uuidv4 from "uuid/v4";
import { upperFirst, camelCase } from 'lodash-es';

export class ModelBorder {
  constructor(model, border, color) {
    this.model = model;
    this.group = new paper.Group();
    this.border = border;
    this.color = color;
    this.radius = 5;
    this.sizeDifference = this.radius * Math.sqrt(2);
    const point = border.path.bounds.topLeft;
    const distanceDifference = this.radius / Math.sqrt(2);
    this.outerBound = new RoundedRectangle({
      point: [point.x - distanceDifference, point.y - distanceDifference],
      size: [
        border.path.bounds.width + this.sizeDifference,
        border.path.bounds.height + this.sizeDifference
      ],
      corners: border.corners
    });
    this.innerBound = new RoundedRectangle({
      point: [point.x + distanceDifference, point.y + distanceDifference],
      size: [
        border.path.bounds.width - this.sizeDifference,
        border.path.bounds.height - this.sizeDifference
      ],
      corners: border.corners
    });
    this.eventArea = new paper.CompoundPath({
      children: [this.outerBound.path, this.innerBound.path],
      fillRule: "evenodd",
      fillColor: "#fff",
      opacity: 0.001
    });
    this.group.addChildren([this.eventArea, this.border.path]);
    this.bindEvents();
  }

  bindEvents() {
    this.mesh = null;
    this.circle = null;
    this.start = null;
    this.dragPath = null;

    this.eventArea.onMouseEnter = this.onMouseEnter.bind(this);
    this.eventArea.onMouseMove = this.onMouseMove.bind(this);
    this.eventArea.onMouseLeave = this.onMouseLeave.bind(this);
    this.eventArea.onMouseDown = this.onMouseDown.bind(this);
    this.eventArea.onMouseDrag = this.onMouseDrag.bind(this);
    this.eventArea.onMouseUp = this.onMouseUp.bind(this);
  }

  onMouseEnter(event) {
    this.border.path.strokeColor = this.model.module_model_id!==undefined ? "#fccd8e" : "#4293f5";
    const relationDragInfo = store.getters.getRelationDragInfo;
    if (
      !relationDragInfo.status ||
      relationDragInfo.source.name !== this.model.name
    ) {
      if (this.mesh) {
        this.mesh.remove();
        this.circle.remove();
      }
      this.circle = new paper.Path.Circle({
        center: event.point,
        radius: this.radius,
        strokeColor: this.model.module_model_id!==undefined ? "#fccd8e" : "#4293f5",
        strokeWidth: 2,
        fillColor: "#fff"
      });
      this.mesh = this.border.path.subtract(this.circle);
      this.eventArea.bringToFront();
      this.mesh.insertBelow(this.eventArea);
      this.circle.insertBelow(this.eventArea);
      if (
        relationDragInfo.status &&
        relationDragInfo.source.name !== this.model.name
      ) {
        const allowedRelation = true; //relationDragInfo.source.checkRelationUniqueness(this.model.name);
        if (!allowedRelation) {
          this.circle.strokeColor = "#f5222d";
          this.border.path.strokeColor = "#f5222d";
        }
        store.commit("setRelationDragInfo", {
          ...relationDragInfo,
          target: this.model,
          allowedRelation
        });
      }
    }
  }

  onMouseMove(event) {
    const relationDragInfo = store.getters.getRelationDragInfo;
    if (
      !relationDragInfo.status ||
      relationDragInfo.source.name !== this.model.name
    ) {
      this.mesh.remove();
      let point = event.point;
      if (
        relationDragInfo.target &&
        relationDragInfo.target.name === this.model.name
      ) {
        const intersections = relationDragInfo.source.canvasElement.border.dragPath.getIntersections(
          this.eventArea
        );
        if (intersections.length) {
          point = intersections[0].point;
        }
      }
      this.circle.position = this.border.path.getNearestPoint(point);
      this.mesh = this.border.path.subtract(this.circle);
      this.eventArea.bringToFront();
      this.mesh.insertBelow(this.eventArea);
    }
  }

  onMouseLeave(event) {
    const relationDragInfo = store.getters.getRelationDragInfo;
    if (
      !relationDragInfo.status ||
      (relationDragInfo.target &&
        relationDragInfo.target.name === this.model.name &&
        !this.model.canvasElement.group.contains(event.point))
    ) {
      this.mesh.remove();
      this.border.path.strokeColor = this.model.module_model_id!==undefined ? "#fccd8e" : "#a8daf2";
      this.circle.remove();
      this.eventArea.bringToFront();
      if (
        relationDragInfo.target &&
        relationDragInfo.target.name === this.model.name
      ) {
        this.circle.strokeColor = "#4287f5";
        this.border.path.strokeColor = this.model.module_model_id!==undefined ? "#fccd8e" :"#4287f5";
        store.commit("setRelationDragInfo", {
          ...relationDragInfo,
          target: null,
          allowedRelation: true
        });
      }
    }
  }

  onMouseDown(event) {
    store.commit("setRelationDragInfo", {
      status: true,
      source: this.model,
      target: null,
      allowedRelation: true
    });
    this.start = this.circle.position;
    this.dragPath = new paper.Path({
      segments: [this.start, event.point],
      strokeColor: "#4287f5",
      opacity: 1
    });
    this.dragPath.sendToBack();
  }

  onMouseDrag(event) {
    event.stopPropagation();
    this.dragPath.removeSegment(1);
    this.dragPath.insert(1, event.point);
    const target = store.getters.getRelationDragInfo.target;
    if (target) {
      target.canvasElement.border.onMouseMove(event);
    }
  }

  onMouseUp(event) {
    if (this.mesh && this.circle && this.dragPath) {
      this.mesh.remove();
      this.circle.remove();
      this.dragPath.remove();
    }
    const relationDragInfo = store.getters.getRelationDragInfo;
    if (
      relationDragInfo.source &&
      relationDragInfo.target &&
      relationDragInfo.allowedRelation
    ) {
      let sfn=relationDragInfo.target.name;
      let tfn=relationDragInfo.source.name;
      if (!relationDragInfo.source.checkFieldUniqieness(sfn) || !relationDragInfo.target.checkFieldUniqieness(tfn) ) {
        for (let i=2; i< 100; i+=1) {
          if (relationDragInfo.source.checkFieldUniqieness(sfn+'_'+i)
            && relationDragInfo.target.checkFieldUniqieness(tfn+'_'+i)){
            sfn = sfn+'_'+i;
            tfn = tfn+'_'+i;
            break;
          }
        }
      }

      //prepare fields for relation
      relationDragInfo.source.addField(
        new Field(
          uuidv4(),
          this.model.schema,
          relationDragInfo.source,
          sfn,
          'System generated relation field',
          5,
          0,
          true,
          null,
          false,
          false,
          false,
          1,
          [])
      );

      relationDragInfo.target.addField(
        new Field(
          uuidv4(),
          this.model.schema,
          relationDragInfo.target,
          tfn,
          'System generated relation field',
          5,
          0,
          true,
          null,
          false,
          false,
          false,
          1,
          [])
      );

      const relation = new Relation(
        makeUuid(),
        this.model.schema,
        relationDragInfo.source,
        relationDragInfo.target,
        1,
        sfn,
        tfn
      );
      relationDragInfo.source.addRelation(relation);
      relationDragInfo.target.addRelation(relation);
    }
    if (relationDragInfo.target) {
      relationDragInfo.target.canvasElement.border.circle.strokeColor = "#4287f5";
      relationDragInfo.target.canvasElement.border.border.path.strokeColor = "#4287f5";
      relationDragInfo.target.canvasElement.border.mesh.strokeWidth = 0;
    }
    store.commit("setRelationDragInfo", {
      status: false,
      source: null,
      target: null,
      allowedRelation: true
    });
    if (!this.eventArea.contains(event.point)) {
      this.onMouseLeave();
    }
    this.eventArea.bringToFront();
  }

  changeSize(size) {
    this.border.changeSize(size);
    this.outerBound.changeSize([
      size[0] + this.sizeDifference,
      size[1] + this.sizeDifference
    ]);
    this.innerBound.changeSize([
      size[0] - this.sizeDifference,
      size[1] - this.sizeDifference
    ]);
  }
}
