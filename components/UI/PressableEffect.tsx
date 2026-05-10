import React, { ReactNode, useCallback, useRef } from 'react';
import { Animated, GestureResponderEvent, Pressable, StyleProp, ViewStyle } from 'react-native';

interface PressableEffectProps {
	children: ReactNode;
	onPress?: (event: GestureResponderEvent) => void;
	style?: StyleProp<ViewStyle>;
	activeColor?: string;
	initialColor?: string;
	durationIn?: number;
	durationOut?: number;
}

const PressableEffect: React.FC<PressableEffectProps> = ({
	children,
	onPress,
	style,
	activeColor = '#e0e0e0',
	initialColor = '#ffffff00',
	durationIn = 120,
	durationOut = 250,
}) => {
	const anim = useRef(new Animated.Value(0)).current;

	const handlePressIn = useCallback(() => {
		Animated.sequence([
			Animated.timing(anim, {
				toValue: 1,
				duration: durationIn,
				useNativeDriver: false,
			}),
			Animated.timing(anim, {
				toValue: 0,
				duration: durationOut,
				useNativeDriver: false,
			}),
		]).start();
	}, [anim, durationIn, durationOut]);


	const backgroundColor = anim.interpolate({
		inputRange: [0, 1],
		outputRange: [initialColor, activeColor],
	});

	return (
		<Pressable
			onPressIn={handlePressIn} // 按下瞬間觸發
			onPressOut={onPress}         // 執行外部邏輯
		>
			<Animated.View style={[style, { backgroundColor }]}>
				{children}
			</Animated.View>
		</Pressable>
	);
};

export default PressableEffect;
