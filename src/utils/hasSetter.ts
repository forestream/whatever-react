/**
 * object의 프로토타입 체인을 검색해서 key 프로퍼티에 setter 함수가 설정되어 있는지 확인합니다.
 * setter 함수가 있다면 전달받은 프롭 값을 `element[key] = value` 형태로 할당할 수 있습니다
 * @param object
 * @param key
 * @returns
 */
export function hasSetter(object: object, key: string): boolean {
	const proto = Object.getPrototypeOf(object);
	const propertyDescriptor =
		proto && Object.getOwnPropertyDescriptor(proto, key);
	const isSetter =
		propertyDescriptor && propertyDescriptor.hasOwnProperty("set");

	if (isSetter) {
		return true;
	}

	if (proto) {
		return hasSetter(proto, key);
	}

	return false;
}
