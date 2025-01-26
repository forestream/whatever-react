type Component = (props: PropsWithoutChildren) => void | ReactNode;
type ComponentTypes = Component | string;
type PropsWithoutChildren = {
	[key: string]: any;
};
type ReactNode = {
	name: string;
	props: PropsWithoutChildren;
	children: Children;
};
type Children = string[] | ReactNode[];
