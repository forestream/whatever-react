# whatever-react

바닐라 자바스크립트로 만들어본 리액트입니다.
사용법은 대체로 리액트와 같고(다만 구현되지 않은 훅들 여럿 있음), 내부 로직은 개인의 작업물입니다.

## 기술 스택

Vite(Vanilla JS), Typescript

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

HTML 어트리뷰트 수정 시 어트리뷰트 키가 `value`라면 `Element.setAttrubute`와 동시에 setter 함수가 있는 프로퍼티에 할당하는 방식으로도(`node[key] = value`) 수정하고, 그 외의 경우 후자의 방식만 사용합니다.

실제 노드의 이벤트 핸들러를 등록할 땐 가상노드의 `attachEventHandlersToDOM` 메서드를 호출합니다.

### `VirtualDOM.compare(virtualNode: VirtualNode, realNode: Node, rerender: () => void)`

`htmlElement` 또는 `primitive` 타입인 가상노드는 그에 상응하는 위치에 실제 DOM 노드가 있을 때 이 메서드로 비교 후에 실제 노드에서 필요한 부분만 수정합니다.  
두 노드가 텍스트 노드일 때는 텍스트 내용을 비교해서 일치하지 않을 경우 실제 텍스트를 가상노드의 값에 맞게 업데이트합니다.

HTMLElement 타입의 가상노드는 상응하는 실제 노드와 비교하여 태그 이름이 일치하지 않으면 (ex. `'div' !== 'span'`) 실제 노드 자체를 교체하고, 이름이 같다면 실제 노드의 속성만 가상노드의 프롭 값과 같도록 업데이트합니다.

### `VirtualNode.prototype.attachEventHandlersToDOM(target: Node, rerender: () => void)`

htmlElement 타입 가상노드를 실체화할 때 이벤트 핸들러는 이 메서드를 사용하여 실제 노드에 부착합니다. 컴포넌트 작성 시 정의되어 프롭으로 전달되는 이벤트 핸들러는 이 메서드 내부에서 또 다른 함수(`realNodeEventHandler`) 내부에 감싸집니다.

실제 노드에 이벤트 핸들러를 부착한 뒤에는 메서드를 호출한 가상노드의 `cleanups` 배열에 `removeEventListener` 메서드를 호출할 함수가 푸쉬됩니다. 이벤트 핸들러를 등록하기 직전에 매번 가상노드의 `callEventHandlerCleanups` 메서드를 실행해서 실제 노드에 등록되어 있던 이벤트 핸들러 함수를 지우고 새로 등록합니다.

#### `onChange` 이벤트

실제 리액트에서는 인풋 이벤트 핸들링을 위해 `onChange` 프롭을 사용하는 것이 컨벤셔널한 방법입니다.
그리고 리액트 이벤트 객체의 `nativeEvent` 프로퍼티를 확인해보면 브라우저에서 발생한 이벤트는 `input` 이벤트이고 이를 감싼 리액트 이벤트의 타입은 `change`임을 확인할 수 있습니다.
이 프로젝트에서도 `onChange` 이벤트 핸들러는 브라우저의 `input` 이벤트를 활용합니다. 사용자의 입력 값이 이전에 입력되어 있던 값과 다를 때 리액트의 `change` 이벤트 핸들러가 실행되고 반대의 경우에는 그렇지 않습니다. 인풋 필드의 값을 복사 붙여넣기 해보면 `change` 이벤트가 발생하지 않는 것을 확인할 수 있습니다. 이와는 별개로 `onInput` 이벤트 핸들러는 이전의 값과 같든 같지 않든 실행됩니다.

`change` 이벤트마다 상태가 업데이트되어 `input` 가상노드가 리렌더링 되면 실제 노드의 `value` 어트리뷰트가 바뀌는 것을 확인할 수 있습니다. (물론 어트리뷰트 값으로 `state` 상태 값이 할당되어야 함)

## babel

아래 명령어로 babel을 실행해서 JSX 문법을 .js 파일로 변환합니다.

- `npx babel [대상파일] --out-dir [추출경로] --extensions '.ts','.tsx'`
