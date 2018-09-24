import { Vector } from "p5";
import Connector from "./Connector";

export default class Wire {
  constructor({
    schema,
    inputConnector,
    outputConnector,
    inputConnectorRef,
    outputConnectorRef
  }) {
    this.schema = schema;
    this.inputConnector =
      inputConnector || this.schema.resolveConnectorRef(inputConnectorRef);
    this.outputConnector =
      outputConnector || this.schema.resolveConnectorRef(outputConnectorRef);
  }

  draw(p) {
    const inputPos = this.inputConnector.getSchemaPos(),
      outputPos = this.outputConnector.getSchemaPos();
    p.push();
    p.strokeWeight(2);
    p.noFill();
    if (false) {
      p.bezier(
        inputPos.x,
        inputPos.y,
        inputPos.x + 50,
        inputPos.y,
        outputPos.x - 50,
        outputPos.y,
        outputPos.x,
        outputPos.y
      );
    } else {
      p.line(inputPos.x, inputPos.y, outputPos.x, outputPos.y);
    }
    p.pop();
  }

  toJSON() {
    return {
      inputConnectorRef: this.inputConnector.makeConnectorRef(),
      outputConnectorRef: this.outputConnector.makeConnectorRef()
    };
  }

  matches(srcConnector, targetConnector) {
    return (
      (srcConnector === this.inputConnector &&
        targetConnector === this.outputConnector) ||
      (targetConnector === this.inputConnector &&
        srcConnector === this.outputConnector)
    );
  }

  simulate() {
    if (this.inputConnector.dir === "output") {
      this.outputConnector.state = this.inputConnector.state;
    } else {
      this.inputConnector.state = this.outputConnector.state;
    }
  }
}
