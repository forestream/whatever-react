type Component = (props: PropsWithoutChildren) => ReactNode;
type ComponentTypes = Component | string;
type PropsWithoutChildren = {
	[key: string]: any;
} | null;
type PropsWithChilldren = PropsWithoutChildren & Children;
type ReactNode = {
	type: string;
	props: PropsWithChilldren;
};
type Children = string[] | ReactNode[] | Children[];
