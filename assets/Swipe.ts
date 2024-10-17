import { _decorator, Component, EventTouch, Node, tween, Vec2 } from 'cc';
const { ccclass } = _decorator;

@ccclass('Swipe')
export class Swipe extends Component {

    startTouchPos: Vec2 | null = null;
    gameBoxes: Node[][]
    protected onLoad(): void {
        this.gameBoxes = this.getBoxes()
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        this.startTouchPos = event.getLocation();
    }

    onTouchEnd(event: EventTouch) {
        if (!this.startTouchPos) return;
        const endTouchPos = event.getLocation();
        const deltaX = endTouchPos.x - this.startTouchPos.x;
        const deltaY = endTouchPos.y - this.startTouchPos.y;
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        if (angle >= 20 && angle < 70) {
            this.moveBoxes('right-up');
        } else if (angle >= 110 && angle < 160) {
            this.moveBoxes('left-up');
        } else if (angle >= -160 && angle < -110) {
            this.moveBoxes('right-down');
        } else if (angle >= -70 && angle < -20) {
            this.moveBoxes('left-down');
        }

        this.startTouchPos = null;
    }

    async moveLeft(boxes: Node[][]) {
        const gridSize = 4;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                while (boxes[i][j] && boxes[i][j].name.includes("black")) {
                    let currentNode = boxes[i][j];
                    let targetIndex = j + 1;

                    if (targetIndex < gridSize && (boxes[i][targetIndex] && !boxes[i][targetIndex].name.includes("black"))) {
                        const targetNode = boxes[i][targetIndex];
                        await this.swapNodesWithAnimation(currentNode, targetNode);
                        boxes[i][targetIndex] = currentNode;
                        boxes[i][j] = targetNode;
                        j = targetIndex;
                    } else {
                        break;
                    }
                }
            }
        }
    }

    async moveRight(boxes: Node[][]) {
        const gridSize = 4;
        for (let i = 0; i < gridSize; i++) {
            for (let j = gridSize - 1; j >= 0; j--) {
                while (boxes[i][j] && boxes[i][j].name.includes("black")) {
                    let currentNode = boxes[i][j];
                    let targetIndex = j - 1;

                    if (targetIndex >= 0 && (boxes[i][targetIndex] && !boxes[i][targetIndex].name.includes("black"))) {
                        const targetNode = boxes[i][targetIndex];
                        await this.swapNodesWithAnimation(currentNode, targetNode);
                        boxes[i][targetIndex] = currentNode;
                        boxes[i][j] = targetNode;
                        j = targetIndex;
                    } else {
                        break;
                    }
                }
            }
        }
    }

    async moveUp(boxes: Node[][]) {
        const gridSize = 4;
        for (let j = 0; j < gridSize; j++) {
            for (let i = 0; i < gridSize; i++) {
                while (boxes[i][j] && !boxes[i][j].name.includes("black")) {
                    let currentNode = boxes[i][j];
                    let targetIndex = i - 1;

                    if (targetIndex >= 0 && (!boxes[targetIndex][j] || boxes[targetIndex][j].name.includes("black"))) {
                        const targetNode = boxes[targetIndex][j];
                        await this.swapNodesWithAnimation(currentNode, targetNode);
                        boxes[targetIndex][j] = currentNode;
                        boxes[i][j] = targetNode;
                        i = targetIndex;
                    } else {
                        break;
                    }
                }
            }
        }
    }

    async moveDown(boxes: Node[][]) {
        const gridSize = 4;
        for (let j = 0; j < gridSize; j++) {
            for (let i = gridSize - 1; i >= 0; i--) {
                while (boxes[i][j] && !boxes[i][j].name.includes("black")) {
                    let currentNode = boxes[i][j];
                    let targetIndex = i + 1;

                    if (targetIndex < gridSize && (!boxes[targetIndex][j] || boxes[targetIndex][j].name.includes("black"))) {
                        const targetNode = boxes[targetIndex][j];
                        await this.swapNodesWithAnimation(currentNode, targetNode);
                        boxes[targetIndex][j] = currentNode;
                        boxes[i][j] = targetNode;
                        i = targetIndex;
                    } else {
                        break;
                    }
                }
            }
        }
    }

    moveBoxes(direction: string) {
        const boxes = this.gameBoxes
        switch (direction) {
            case 'right-down':
                this.moveLeft(boxes);
                break;
            case 'right-up':
                this.moveRight(boxes);
                break;
            case 'left-up':
                this.moveUp(boxes);
                break;
            case 'left-down':
                this.moveDown(boxes);
                break;
            default:
                return;
        }
    }

    getBoxes(): Node[][] {
        const parentNode = this.node.getChildByName('spriteFrame');
        if (!parentNode) return [];
        const children = parentNode.children;
        const gridSize = 4;
        const boxes: Node[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const index = i * gridSize + j;
                if (index < children.length) {
                    boxes[i][j] = children[index];
                }
            }
        }
        return boxes;
    }

    async swapNodesWithAnimation(nodeA: Node, nodeB: Node, duration: number = 0.1): Promise<void> {
        const positionA = nodeA.position.clone();
        const positionB = nodeB.position.clone();
        await new Promise<void>((resolve) => {
            tween(nodeA)
                .to(duration, { position: positionB })
                .call(() => {
                    nodeA.position = positionB;
                    resolve();
                })
                .start();
        });
        await new Promise<void>((resolve) => {
            tween(nodeB)
                .to(duration, { position: positionA })
                .call(() => {
                    nodeB.position = positionA;
                    resolve();
                })
                .start();
        });
        nodeA.setPosition(positionB)
        nodeB.setPosition(positionA)

    }

    update(deltaTime: number) {

    }
}