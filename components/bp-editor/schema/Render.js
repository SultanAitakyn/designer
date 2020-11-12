import { BlockType } from "../block/Block";
import { ElementsDrawParams } from "../block/blocks/ElementsParams";

const BASELINE = 263;
const DEFAULT_OFFSET = 40;
let conditionLinks = [];

export class Render {
  constructor(blocks, links) {
    this.blocks = blocks;
    this.links = links;
  }

  calculateBaseLineBlocksCoordinate(block) {
    for (const link of this.links) {
      if (block.type !== BlockType.END) {
        if (block.id === link.from.id) {
          let currentLink = link;
          if (block.type === BlockType.CONDITION) {
            let conditionEnd = this.findConditionEnd(block);
            this.calculateAllConditionBranches(block, true, BASELINE);
            currentLink = this.links.find(v => v.to.id === conditionEnd.id);
          } else {
            this.moveBlockToRight(currentLink.to, currentLink.from);
            const blockTop = this.blockTop(currentLink.to, BASELINE);
            currentLink.to.y = blockTop.top;
            currentLink.to.type === BlockType.CYCLE
              ? (currentLink.to.height = blockTop.loopHeight)
              : null;
          }
          return this.calculateBaseLineBlocksCoordinate(currentLink.to);
        }
      }
    }
  }

  reOrderBlocksInData() {  // Сортировка блоков по возрастанию координаты х, для того, чтобы блоки строились последовательно в DOM.
    this.blocks.sort((a, b) => a.x - b.x);
  }

  alignCenterScheme() {
    const canvasWidth = document.querySelector(".canvas").offsetWidth/2;
    const schemeWidth = (this.blocks[this.blocks.length - 1].x - this.blocks[0].x)/2;
    const newStartCoordinate = canvasWidth - schemeWidth;
    const offset = newStartCoordinate > 40 ? (newStartCoordinate - this.blocks[0].x) : (40 - this.blocks[0].x);
    if (offset) {
      this.blocks.forEach((item, index, array) => array[index].x = Math.round(item.x + offset));
    }
  }

  calculateAllConditionBranches(block, isFirstIteration, baseLine) {
    let isCaseBlock = block.condition_type === 7 && true;
    let branches = this.links.filter(v => v.from.id === block.id);
    isCaseBlock
      ? branches.sort(
      (a, b) => parseFloat(a.default_order) - parseFloat(b.default_order)
      )
      : branches.sort((a, b) => a.value - b.value);
    let endBlocks = [];
    let conditionEnd = this.findConditionEnd(block);
    for (let i = 0; i < branches.length; i++) {
      if (!isFirstIteration) {
        const upperCase =
          isCaseBlock && branches[i - 1] ? branches[i - 1].to : null;
        baseLine = this.calculateBaseLine(
          block,
          baseLine,
          conditionEnd,
          isCaseBlock,
          branches[i].to,
          upperCase
        );
      }
      let end = this.calculateConditionBranch(
        branches[i],
        block,
        conditionEnd,
        baseLine,
        true
      );
      endBlocks.push({ ...end });
      isFirstIteration = false;
    }
    this.calculateConditionEndCoordinate(endBlocks, conditionEnd);
  }

  calculateConditionEndCoordinate(endBlocks, conditionEnd) {
    conditionEnd.x = Math.max(...endBlocks.map(v => v.x));
    conditionEnd.y = Math.min(...endBlocks.map(v => v.y));
  }

  calculateBaseLine(
    block,
    baseLine,
    conditionEnd,
    isCaseBlock,
    blockForCase,
    upperCase
  ) {
    block = isCaseBlock ? upperCase : block;
    let conditions = this.getAllConditions(block, conditionEnd, []);
    if (isCaseBlock) {
      return this.calcCaseBaseline(
        conditions,
        baseLine,
        conditionEnd,
        upperCase,
        blockForCase
      );
    } else {
      return this.calcBaseline(conditions, baseLine, 0, false);
    }
  }

  calculateConditionBranch(
    branch,
    block,
    conditionEnd,
    baseLine,
    isFirstIteration
  ) {
    for (let link of this.links) {
      if (block.id !== conditionEnd.id) {
        if (block.id === link.from.id) {
          if (isFirstIteration) {
            link = branch;
            let oldLinkIndex = conditionLinks.findIndex(
              v => v.link === link.id
            );
            if (oldLinkIndex !== -1) {
              if (conditionLinks[oldLinkIndex].y <= baseLine) {
                conditionLinks.splice(oldLinkIndex, 1);
                conditionLinks.push({ link: link.id, y: baseLine });
              }
            } else {
              conditionLinks.push({ link: link.id, y: baseLine });
            }
          }
          link.to.x =
            block.x +
            this.blockWidth(link.from.type, link.to.type) +
            ElementsDrawParams.lineWidth;
          const blockTop = this.blockTop(link.to, baseLine);
          link.to.y = blockTop.top;
          link.to.type === BlockType.CYCLE
            ? (link.to.height = blockTop.loopHeight)
            : null;
          if (block.type === BlockType.CONDITION && !isFirstIteration) {
            conditionLinks.push({ link: link.id, y: baseLine });
            this.calculateAllConditionBranches(block, true, baseLine);
            block = this.findConditionEnd(block);
          } else {
            block = link.to;
          }
          isFirstIteration = false;
          return this.calculateConditionBranch(
            branch,
            block,
            conditionEnd,
            baseLine,
            isFirstIteration
          );
        }
      } else {
        return block;
      }
    }
  }

  blockWidth(blockType, toBlockType) {
    switch (true) {
      case blockType === BlockType.START || blockType === BlockType.END: {
        return ElementsDrawParams.startEndBlocksWidth;
      }
      case blockType === BlockType.CYCLE &&
      toBlockType === BlockType.CYCLE_END: {
        return ElementsDrawParams.loopBlockWidth - ElementsDrawParams.lineWidth;
      }
      case blockType === BlockType.CYCLE_END || blockType === BlockType.CYCLE: {
        return 0;
      }
      default: {
        return ElementsDrawParams.blockWidth;
      }
    }
  }

  blockTop(toBlock, baseLine) {
    let top = baseLine;
    top -=
      this.blockHeight(toBlock.type) / 2 - ElementsDrawParams.lineHeight / 2;
    let loopHeight;
    if (toBlock.type === BlockType.CYCLE) {
      const loopParams = this.loopCount(
        toBlock,
        0,
        0,
        [-1],
        0,
        0,
        baseLine,
        0,
        []
      );
      const count = loopParams.loopCount;
      loopHeight = this.calculateLoopHeight(loopParams, loopParams.loopInsideHeight);
      if (count === 0) {
        top = baseLine - ElementsDrawParams.lineWidth;
      } else {
        top = baseLine - ElementsDrawParams.lineWidth - count * 20;
      }
    }
    if (toBlock.type === BlockType.END) {
      top = 281;
    }
    return { top: Math.round(top), loopHeight };
  }

  calculateLoopHeight(loopParams, loopHeight) {
    if (loopParams.loopInsideHeight) {
      loopHeight = DEFAULT_OFFSET + loopParams.loopInsideHeight;
    } else {
      loopHeight = loopParams.loopCount * (2 * 20) + ElementsDrawParams.loopBlockHeight;
    }
    if (loopParams.cndHeight) {
      const loopUpperHalfHeight = (loopParams.loopCount * (2 * 20) + ElementsDrawParams.loopBlockHeight) / 2;
      const loopBottomHalfHeight = loopHeight - loopUpperHalfHeight;
      if (loopParams.cndHeight > loopBottomHalfHeight) {
        loopHeight = loopUpperHalfHeight + loopParams.cndHeight +  DEFAULT_OFFSET;
      }
    }
    return loopHeight;
  }

  loopCount(
    block,
    start,
    end,
    nestedLoops,
    skipBlocks,
    cndHeight,
    baseLine,
    loopInsideHeight,
    insideLoopConditions
  ) {
    for (let link of this.links) {
      if (link.from.id === block.id) {
        if (block.type === BlockType.CYCLE) {
          start++;
          if (skipBlocks === 0) {
            nestedLoops[nestedLoops.length - 1]++;
          } else {
            skipBlocks--;
          }
          if (start > 1) {
            const loopEnd = this.findLoopEnd(block, 0, 0);
            const loopConditions = this.checkForConditionInsideLoop(
              block,
              loopEnd,
              []
            );
            if (loopConditions.length) {
              const loopHeight = this.blockTop(block, baseLine).loopHeight;
              insideLoopConditions.push(...loopConditions);
              if (loopHeight > loopInsideHeight) {
                loopInsideHeight = loopHeight;
              }
            }
          }
          block = link.to;
        } else if (block.type === BlockType.CYCLE_END) {
          end++;
          if (start === end) {
            return {
              loopCount: Math.max(...nestedLoops),
              cndHeight,
              loopInsideHeight
            };
          } else if (end === start - 1) {
            nestedLoops.push(0);
            skipBlocks = 0;
          } else {
            skipBlocks++;
          }
          block = link.to;
        } else if (block.type === BlockType.CONDITION) {
          if (!insideLoopConditions.includes(block)) {
            const condEnd = this.findConditionEnd(block);
            const conditions = this.getAllConditions(block, condEnd, []);
            const cndMin = this.calcBaseline(conditions, baseLine, 0, true);
            const height = cndMin - baseLine;
            if (height > cndHeight) {
              cndHeight = height;
            }
          }
          block = this.getConditionFirstBranchFirstBlock(block);
        } else {
          block = link.to;
        }
        return this.loopCount(
          block,
          start,
          end,
          nestedLoops,
          skipBlocks,
          cndHeight,
          baseLine,
          loopInsideHeight,
          insideLoopConditions
        );
      }
    }
  }

  checkForConditionInsideLoop(block, end, conditions) {
    for (const link of this.links) {
      if (link.from.id === block.id) {
        if (block.id !== end.id) {
          if (block.type === BlockType.CONDITION) {
            conditions.push(block);
          }
          return this.checkForConditionInsideLoop(link.to, end, conditions);
        } else {
          return conditions;
        }
      }
    }
  }

  findLoopEnd(block, start, end) {
    for (let link of this.links) {
      if (link.from.id === block.id) {
        if (block.type === BlockType.CYCLE) {
          start++;
        }
        if (block.type === BlockType.CYCLE_END) {
          end++;
          if (start === end) {
            return block;
          }
        }
        return this.findLoopEnd(link.to, start, end);
      }
    }
  }

  moveBlockToRight(movingBlock, previousBlock) {
    movingBlock.x =
      previousBlock.x +
      this.blockWidth(previousBlock.type, movingBlock.type) +
      ElementsDrawParams.lineWidth;
  }

  collectBlocksFromCurrentBlockToEnd(block, arrayOfBlocks) {
    for (let i = 0; i < this.links.length; i++) {
      if (block.type !== BlockType.END) {
        if (block.id === this.links[i].from.id) {
          arrayOfBlocks.push(block);
          block = this.links[i].to;
          i = -1;
        }
      } else {
        arrayOfBlocks.push(block);
        i = this.links.length;
      }
    }
    return arrayOfBlocks;
  }

  findConditionEnd(block) {
    const branches = this.links.filter(v => v.from.id === block.id);
    const firstBranchValue = branches[0].value;
    const secondBranchValue = branches[1].value;
    const firstFalseBranchBlock = this.links.find(
      v => v.from.id === block.id && v.value === firstBranchValue
    ).to;
    const firstTrueBranchBlock = this.links.find(
      v => v.from.id === block.id && v.value === secondBranchValue
    ).to;
    let falseBranchBlocks = this.collectBlocksFromCurrentBlockToEnd(
      firstFalseBranchBlock,
      []
    );
    let trueBranchBlocks = this.collectBlocksFromCurrentBlockToEnd(
      firstTrueBranchBlock,
      []
    );
    return falseBranchBlocks.find(block => trueBranchBlocks.includes(block));
  }

  getConditionFirstBranchFirstBlock(block) {
    let branch = this.links.find(
      v => v.from.id === block.id && v.value === false
    );
    if (!branch) {
      branch = this.links.find(
        v => v.from.id === block.id && Number(v.default_order) === 0
      );
    }
    return branch.to;
  }

  getAllConditions(block, condEnd, conditions) {
    for (const link of this.links) {
      if (block.id !== condEnd.id) {
        if (block.id === link.from.id) {
          if (block.type === BlockType.CONDITION) {
            conditions.splice(0, 0, block);
            block = this.getConditionFirstBranchFirstBlock(block);
          } else if (block.type === BlockType.CYCLE) {
            block = this.findLoopEnd(block, 0, 0);
          } else {
            block = link.to;
          }
          return this.getAllConditions(block, condEnd, conditions);
        }
      } else {
        return conditions;
      }
    }
  }

  calcCaseBaseline(conditions, baseLine, condEnd, currentCase, nextCase) {
    const conditionsMin = conditions.length
      ? this.calcBaseline(conditions, baseLine, 0, true)
      : 0;
    const upperBranchMin = currentCase
      ? this.falseBranchMinimum(currentCase, condEnd, baseLine + 30, baseLine)
      : baseLine;
    const currentBranchTop = this.trueBranchTop(nextCase, condEnd, 30, []);
    if (conditionsMin < upperBranchMin) {
      baseLine =
        upperBranchMin + currentBranchTop.maxBlockUpperHalfHeight + DEFAULT_OFFSET;
    } else {
      baseLine =
        conditionsMin + currentBranchTop.maxBlockUpperHalfHeight + DEFAULT_OFFSET;
    }
    return baseLine;
  }

  calcBaseline(
    conditions,
    baseLine,
    minFromPreviousCnd,
    isNeedMinimumNotBaseline
  ) {
    for (let i = 0; i < conditions.length; i++) {
      const cndEnd = this.findConditionEnd(conditions[i]);
      if (conditions[i].condition_type === 7) {
      minFromPreviousCnd = this.calculateAllCasesMinCoordinate(baseLine, conditions[i]);
      } else {
        minFromPreviousCnd = this.calcCndMin(
          conditions[i],
          cndEnd,
          baseLine,
          minFromPreviousCnd,
          i === conditions.length - 1,
          isNeedMinimumNotBaseline
        );
      }
    }
    return !minFromPreviousCnd.cndMin ? minFromPreviousCnd : isNeedMinimumNotBaseline
      ? minFromPreviousCnd.cndMin
      : minFromPreviousCnd.cndMin - minFromPreviousCnd.maxLoopBottomHalfHeight;
  }

  calcCndMin(
    condition,
    conditionEnd,
    baseLine,
    minFromPreviousCnd,
    isFirstCondition,
    isNeedMinimumNotBaseline
  ) {
    const defaultMin = baseLine + ElementsDrawParams.lineHeight / 2;
    let branch = this.links.find(
      v => v.from.id === condition.id && v.value === true
    );
    if (!branch) {
      branch = this.links.find(
        v => v.from.id === condition.id && Number(v.default_order) === 1
      );
    }
    const trueBranchFirstBlock = branch.to;
    let falseBranchMin = this.falseBranchMinimum(
      condition,
      conditionEnd,
      defaultMin,
      baseLine
    );
    if (falseBranchMin < minFromPreviousCnd.cndMin) {
      falseBranchMin = minFromPreviousCnd.cndMin;
    }
    const trueBranchParams = this.trueBranchTop(
      trueBranchFirstBlock,
      conditionEnd,
      30,
      [],
      30
    );
    let trueBranchMaxHeight = trueBranchParams.maxBlockUpperHalfHeight;
    const maxLoopBottomHalfHeight = trueBranchParams.maxLoopBottomHalfHeight;
    const newBaseLine =
      falseBranchMin + trueBranchMaxHeight + DEFAULT_OFFSET;
    let cndMin;
    if (
      (trueBranchParams.conditions.length && !isFirstCondition) ||
      (trueBranchParams.conditions.length && isNeedMinimumNotBaseline)
    ) {
      cndMin = this.calcBaseline(
        trueBranchParams.conditions,
        newBaseLine,
        0,
        true
      );
    } else {
      cndMin = newBaseLine + maxLoopBottomHalfHeight;
    }
    return { cndMin, maxLoopBottomHalfHeight };
  }

  calculateAllCasesMinCoordinate(baseLine, block) {
    let branches = this.links.filter(v => v.from.id === block.id);
    branches.sort(
      (a, b) => parseFloat(a.default_order) - parseFloat(b.default_order)
    );
    let conditionEnd = this.findConditionEnd(block);
    for (let i = 1; i < branches.length; i++) {
      const upperCase = branches[i - 1] ? branches[i - 1].to : null;
      baseLine = this.calculateBaseLine(
        block,
        baseLine,
        conditionEnd,
        true,
        branches[i].to,
        upperCase
      );
    }
    return baseLine;
  }

  falseBranchMinimum(block, end, min, baseLine) {
    for (const link of this.links) {
      if (end.id !== block.id) {
        if (block.id === link.from.id) {
          if (block.type === BlockType.CYCLE) {
            const loopParams = this.loopCount(
              block,
              0,
              0,
              [-1],
              0,
              0,
              baseLine,
              ElementsDrawParams.loopBlockHeight,
              []
            );
            const count = loopParams.loopCount;
            let loopMinimum =
              baseLine +
              ElementsDrawParams.lineHeight +
              ElementsDrawParams.lineWidth +
              count * 20;
            if (
              loopParams.cndHeight &&
              loopParams.cndHeight + baseLine + DEFAULT_OFFSET > loopMinimum
            ) {
              loopMinimum = loopParams.cndHeight + baseLine + DEFAULT_OFFSET;
            }
            if (min < loopMinimum) {
              min = loopMinimum;
            }
            block = link.to;
          } else if (block.type === BlockType.CONDITION) {
            block = this.getConditionFirstBranchFirstBlock(block);
          } else {
            block = link.to;
          }
          return this.falseBranchMinimum(block, end, min, baseLine);
        }
      } else {
        return min;
      }
    }
  }

  trueBranchTop(block, end, maxBlockUpperHalfHeight, conditions, maxLoopBottomHalfHeight) {
    for (const link of this.links) {
      if (end.id !== block.id) {
        if (block.id === link.from.id) {
          if (block.type === BlockType.CYCLE) {
            const loopParams = this.loopCount(
              block,
              0,
              0,
              [-1],
              0,
              0,
              0,
              0,
              []
            );
            const loopUpperHalfHeight = (loopParams.loopCount * (2 * 20) + ElementsDrawParams.loopBlockHeight) / 2;
            const loopBottomHalfHeight = this.calculateLoopHeight(loopParams, 200) - loopUpperHalfHeight;
            if (maxBlockUpperHalfHeight < loopUpperHalfHeight) {
              maxBlockUpperHalfHeight = loopUpperHalfHeight;
            }
            if (maxLoopBottomHalfHeight < loopBottomHalfHeight) {
              maxLoopBottomHalfHeight = loopBottomHalfHeight;
            }
            block = this.findLoopEnd(block, 0, 0);
          } else if (block.type === BlockType.CONDITION) {
            conditions.splice(0, 0, block);
            block = this.getConditionFirstBranchFirstBlock(block);
          } else {
            block = link.to;
          }
          return this.trueBranchTop(block, end, maxBlockUpperHalfHeight, conditions, maxLoopBottomHalfHeight);
        }
      } else {
        return { maxBlockUpperHalfHeight, conditions, maxLoopBottomHalfHeight };
      }
    }
  }

  renderLinks() {
    for (const link of this.links) {
      if (link.from.type === BlockType.START) {
        link.x = link.from.x + ElementsDrawParams.startEndBlocksWidth;
        link.y = BASELINE;
      } else if (link.from.type === BlockType.CYCLE_END) {
        link.x = link.from.x;
        link.y = link.from.y + ElementsDrawParams.lineWidth;
      } else if (link.value !== undefined) {
        link.x = link.from.x + ElementsDrawParams.blockWidth;
        link.y = conditionLinks.find(v => v.link === link.id).y;
      } else {
        link.x = link.from.x + ElementsDrawParams.blockWidth;
        link.y = link.from.y;
      }
    }
    // Для связи внутри цикла, нужно знать предыщую связь до цикла
    for (const link of this.links) {
      if (link.from.type === BlockType.CYCLE) {
        const beforeLoopY = this.links.find(v => v.to.id === link.from.id).y;
        link.x = link.from.x;
        link.y = beforeLoopY;
      }
    }
    conditionLinks = [];
  }

  blockHeight(blockType) {
    switch (blockType) {
      case BlockType.START: {
        return ElementsDrawParams.startEndBlocksHeight;
      }
      case BlockType.END: {
        return ElementsDrawParams.startEndBlocksHeight;
      }
      case BlockType.CYCLE: {
        return ElementsDrawParams.loopBlockHeight;
      }
      case BlockType.CYCLE_END: {
        return ElementsDrawParams.loopBlockHeight;
      }
      default: {
        return ElementsDrawParams.blockHeight;
      }
    }
  }
}
