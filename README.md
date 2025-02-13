# whatever-react

바닐라 자바스크립트로 만들어본 리액트입니다.
사용법은 대체로 리액트와 같고(다만 구현되지 않은 훅들 여럿 있음), 내부 로직은 개인의 작업물입니다.

## 주요 개념

### `React`

`useState`, `createRoot`, `createElement` 등의 리액트의 대표적인 함수들과 내부적으로 쓰일 함수가 담긴 객체를 반환합니다.
`/src/react/jsx-runtime/index.ts`에서 import해서 사용할 수 있습니다.

### `VirtualNode`

`VirtualDOM` 트리를 구성할 기본 단위인 가상노드 클래스스입니다.

#### `children`

`VirtualNode` 인스턴스의 프로퍼티로 해당 노드의 자식 노드들이 배열로 등록됩니다.

#### `parentNode`

`VirtualNode` 인스턴스의 프로퍼티로 해당 노드의 부모 노드가 등록됩니다.

#### 'appendChild(child: VirtualNode)`

노드의 자식 노드로 `child` 노드를 `this.children` 배열에 `push`합니다. `child` 노드의 부모가 메서드를 호출한 노드로 정해집니다.

### `VirtualDOM`

`VirtualNode`를 트리 구조로 관리하는 클래스입니다.
깊이 우선 탐색으로 트리를 순회하며 가상노드를 생성하거나 실제 노드를 생성해서 삽입합니다.

## 렌더링

### `React.createRoot(root: HTMLElement)`

실제 DOM 노드 `root`를 취득해서 `VirtualDOM` 인스턴스의 루트노드로 저장하고
`{ render }` 객체를 반환합니다.
`render` 메서드를 사용해서 컴포넌트를 렌더링합니다.

### `React.render(reactElement: ReactElement)`

인수로 전달받은 `ReactElement`를 가상노드로 만들고 가상 트리를 형성한 후 가상 DOM 루트에 자손으로 연결합니다. 완성된 가상 DOM을 실체화합니다. (실제 DOM에 삽입합니다.)

### `VirtualDOM.prototype.initializeVirtualDOM(reactElement: ReactElement)`

초기 렌더링 메서드입니다. `VirtualDOM.generateVirtualDOMTree`를 호출해서 결과적으로 만들어진 트리를 현재 가상 DOM 루트노드의 자손으로 붙이고 해당 시점의 가상 DOM을 실체화합니다.

### `VirtualDOM.generateVirtualDOMTree(reactElement: ReactElement)`

인수로 전달받은 `reactElement`를 가상노드로 만들고 첫번째 자손노드부터 재귀적으로 순회하여 그 자손 노드를 생성합니다. 순회를 완료한 노드는 트리 형태가 되고 이를 반환합니다.

### `VirtualDOM.prototype.realizeVirtualDOM()`

현재 가상 DOM의 루트노드부터 첫번째 자손노드를 재귀적으로 순회하며 실제 노드를 생성해서 DOM에 생성/수정합니다. 논리 흐름이 작업이 끝난 가상노드의 부모로 옮겨갈 때 실제 노드의 인덱스를 사용하여 다음 작업할 실제 노드를 찾을 수 있습니다.

실제 노드 인덱스에 이미 노드가 있는 경우 `VirtualDOM.compare` 메서드를 통해 수정 작업을 진행합니다. HTML 요소 이름이 다르거나 하는 이유로 노드를 전체 교체해야 한다면 필요한 노드를 새로 생성해서 교체하고(`Node.replaceChild()`) 어트리뷰트나 텍스트 등의 수정이 필요할 때는 필요한 부분만 수정합니다.

어트리뷰트 수정 시 `Element.setAttrubute`와 동시에 setter 함수가 있는 프로퍼티에 할당하는 방식으로도(`node[key] = value`) 수정합니다.

## babel

아래 명령어로 babel을 실행해서 JSX 문법을 .js 파일로 변환합니다.

- `npx babel src --out-dir babel --extensions '.ts','.tsx'`
