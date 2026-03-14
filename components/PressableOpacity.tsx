import { Pressable } from "react-native";

export function PressableOpacity(
	{ children, PressStyle, onPress } 
	: 
	{ children?: any, PressStyle?: object, onPress?: () => void }
) {
	return (
		<Pressable
			style={({ pressed }) => [
				{
					opacity: pressed ? 0.5 : 1.0, // Change opacity when pressed
				},
				PressStyle
			]}
			onPress={onPress}
		>
			{children}
		</Pressable>
	)
}